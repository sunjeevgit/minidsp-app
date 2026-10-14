import { supabase } from '@/lib/db/client';

export async function exportScanToCSV(scanId: string) {
  // 1. Fetch scan and findings for the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .single();

  if (scanError || !scan) throw new Error('Scan not found');

  const { data: findings, error: findingsError } = await supabase
    .from('findings')
    .select('*')
    .eq('scan_id', scanId)
    .eq('user_id', user.id);

  if (findingsError) throw new Error('Could not fetch findings');

  // 2. Build CSV content
  // Prevent formula injection by prefixing cells starting with =, +, -, @ with a quote
  const sanitizeCell = (val: string) => {
    const s = String(val);
    if (['=', '+', '-', '@'].includes(s.charAt(0))) {
      return `"${s}"`;
    }
    return `"${s.replace(/"/g, '""')}"`;
  };

  const header = ['Scan ID', 'Filename', 'Date', 'Risk', 'PII Type', 'Count', 'Masked Example'];
  const rows = findings.map(f => [
    sanitizeCell(scan.id),
    sanitizeCell(scan.filename),
    sanitizeCell(scan.scanned_at),
    sanitizeCell(f.risk),
    sanitizeCell(f.type),
    sanitizeCell(f.match_count.toString()),
    sanitizeCell(f.masked_example),
  ]);

  const csvContent = [
    header.join(','),
    ...rows.map(row => row.join(','))
  ].join('\\n');

  return {
    csvContent,
    filename: `minidsp_export_${scan.filename}.csv`
  };
}
