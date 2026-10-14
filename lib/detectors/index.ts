export type FindingRisk = 'Low' | 'Medium' | 'High' | 'Critical';

export interface DetectionMatch {
  value: string;
  index: number;
  type: 'Email' | 'UK Phone' | 'UK NINO' | 'Payment Card';
  risk: FindingRisk;
}

/**
 * Luhn Algorithm for Payment Card Validation
 */
export function validateLuhn(number: string): boolean {
  const sanitized = number.replace(/[\s-]/g, '');
  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export const detectEmail = (text: string): DetectionMatch[] => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches: DetectionMatch[] = [];
  let match;
  while ((match = emailRegex.exec(text)) !== null) {
    matches.push({
      value: match[0],
      index: match.index,
      type: 'Email',
      risk: 'Low',
    });
  }
  return matches;
};

export const detectUKPhone = (text: string): DetectionMatch[] => {
  // Matches common UK formats: +44..., 07..., 01..., etc.
  const phoneRegex = /(?:\+44|0)(?:\s?7\d{3}\s?\d{6}|(?:\s?1\d{1,2}\s?\d{3}\s?\d{4}))/g;
  const matches: DetectionMatch[] = [];
  let match;
  while ((match = phoneRegex.exec(text)) !== null) {
    matches.push({
      value: match[0],
      index: match.index,
      type: 'UK Phone',
      risk: 'Medium',
    });
  }
  return matches;
};

export const detectUKNINO = (text: string): DetectionMatch[] => {
  // Format: 2 letters, 6 digits, 1 letter (A, B, C, or D)
  const ninoRegex = /\b[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi;
  const matches: DetectionMatch[] = [];
  let match;
  while ((match = ninoRegex.exec(text)) !== null) {
    matches.push({
      value: match[0],
      index: match.index,
      type: 'UK NINO',
      risk: 'High',
    });
  }
  return matches;
};

export const detectPaymentCard = (text: string): DetectionMatch[] => {
  // 13-19 digits allowing spaces/hyphens
  const cardRegex = /\b(?:\d[ -]*?){13,19}\b/g;
  const matches: DetectionMatch[] = [];
  let match;
  while ((match = cardRegex.exec(text)) !== null) {
    const value = match[0];
    if (validateLuhn(value)) {
      matches.push({
        value: value,
        index: match.index,
        type: 'Payment Card',
        risk: 'Critical',
      });
    }
  }
  return matches;
};
