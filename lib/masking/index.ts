import { DetectionMatch } from '../detectors';

export function maskValue(match: DetectionMatch): string {
  const { value, type } = match;

  switch (type) {
    case 'Email': {
      const [local, domain] = value.split('@');
      if (!local || !domain) return '***@***.***';
      return `${local.substring(0, 2)}***@${domain.substring(0, 2)}***`;
    }
    case 'UK Phone': {
      const sanitized = value.replace(/[\s-]/g, '');
      return `***${sanitized.slice(-4)}`;
    }
    case 'UK NINO': {
      const sanitized = value.replace(/\s/g, '').toUpperCase();
      return `${sanitized.substring(0, 2)}******${sanitized.slice(-1)}`;
    }
    case 'Payment Card': {
      const sanitized = value.replace(/[\s-]/g, '');
      return `**** **** **** ${sanitized.slice(-4)}`;
    }
    default:
      return '***MASKED***';
  }
}
