import DOMPurify from 'dompurify';

export class SecurityUtils {
  private static readonly ALLOWED_FILE_SIGNATURES = new Map([
    ['25504446', 'pdf'], // %PDF
    ['504B0304', 'zip'], // ZIP
    ['504B0506', 'zip'], // ZIP (empty)
    ['504B0708', 'zip'], // ZIP (spanned)
  ]);

  static sanitizeHTML(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div'],
      ALLOWED_ATTR: ['class', 'style'],
    });
  }

  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // 기본 태그 제거
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static async validateFileSignature(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arr = new Uint8Array(e.target?.result as ArrayBuffer);
          const header = Array.from(arr.slice(0, 4))
            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
            .join('');
          
          resolve(this.ALLOWED_FILE_SIGNATURES.has(header));
        } catch {
          resolve(false);
        }
      };
      
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  static validateFileSize(file: File, maxSizeMB = 50): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }

  static validateEnvironment(): { isValid: boolean; missing: string[] } {
    const required = ['VITE_APP_ENV'];
    const missing = required.filter(key => !import.meta.env[key]);
    
    return {
      isValid: missing.length === 0,
      missing
    };
  }

  static obfuscateKey(key: string): string {
    if (!key) return '';
    const length = key.length;
    if (length <= 8) return '*'.repeat(length);
    return key.substring(0, 4) + '*'.repeat(length - 8) + key.substring(length - 4);
  }
}

export default SecurityUtils;