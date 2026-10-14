import { detectEmail, detectUKPhone, detectUKNINO, detectPaymentCard, DetectionMatch, FindingRisk } from '../detectors';
import { maskValue } from '../masking';
import { supabase } from '../db/client';

export interface ScanResult {
  scanId: string;
  risk: FindingRisk | 'None';
  totalFindings: number;
  findings: {
    type: DetectionMatch['type'];
    risk: FindingRisk;
    count: number;
    maskedExample: string;
  }[];
}

/**
 * Orchestrates the scanning of a single file.
 * This is a server-side function.
 */
export async function performScan(userId: string, filename: string, content: string): Promise<ScanResult> {
  // 1. Validation: Size (1 MiB = 1,048,576 bytes)
  const byteSize = new TextEncoder().encode(content).length;
  if (byteSize === 0) throw new Error('File is empty');
  if (byteSize > 1048576) throw new Error('File size exceeds 1 MiB limit');

  // 2. Run all detectors
  const allMatches: DetectionMatch[] = [
    ...detectEmail(content),
    ...detectUKPhone(content),
    ...detectUKNINO(content),
    ...detectPaymentCard(content),
  ];

  // 3. Aggregate findings by type
  const aggregates: Record<string, { count: number; risk: FindingRisk; example: DetectionMatch }> = {};

  allMatches.forEach(match => {
    if (!aggregates[match.type]) {
      aggregates[match.type] = {
        count: 0,
        risk: match.risk,
        example: match
      };
    }
    aggregates[match.type].count++;

    // Update risk to the highest found for this type if needed
    // (though in our current detectors, risk is fixed per type)
  });

  const riskWeights: Record<FindingRisk | 'None', number> = {
    'None': 0,
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Critical': 4,
  };

  let highestRisk: FindingRisk | 'None' = 'None';
  const finalFindings = Object.entries(aggregates).map(([type, data]) => {
    if (riskWeights[data.risk] > riskWeights[highestRisk]) {
      highestRisk = data.risk;
    }
    return {
      type: type as DetectionMatch['type'],
      risk: data.risk,
      count: data.count,
      maskedExample: maskValue(data.example)
    };
  });

  // 4. Database Persistence (Atomic operation)
  // We use a transaction-like approach: create scan, then findings.

  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      filename: filename.substring(0, 255), // Sanitize length
      risk: highestRisk,
      finding_count: allMatches.length,
    })
    .select()
    .single();

  if (scanError || !scanData) {
    throw new Error(`Database error creating scan: ${scanError?.message}`);
  }

  if (finalFindings.length > 0) {
    const findingsToInsert = finalFindings.map(f => ({
      scan_id: scanData.id,
      user_id: userId,
      type: f.type,
      risk: f.risk,
      match_count: f.count,
      masked_example: f.maskedExample
    }));

    const { error: findingsError } = await supabase
      .from('findings')
      .insert(findingsToInsert);

    if (findingsError) {
      // Rollback: Delete the scan if findings fail to maintain atomicity
      await supabase.from('scans').delete().eq('id', scanData.id);
      throw new Error(`Database error creating findings: ${findingsError.message}`);
    }
  }

  return {
    scanId: scanData.id,
    risk: highestRisk,
    totalFindings: allMatches.length,
    findings: finalFindings,
  };
}
