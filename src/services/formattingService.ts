// 코드 포매팅 서비스 (Prettier 통합)

import * as prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserTypeScript from 'prettier/parser-typescript';
import parserPostcss from 'prettier/parser-postcss';
import parserHtml from 'prettier/parser-html';
import type { SupportedLanguage, PrettierResult } from '../types';

// Prettier options type (for compatibility)
type PrettierOptions = any;

export class FormattingService {
  private static instance: FormattingService;

  static getInstance(): FormattingService {
    if (!FormattingService.instance) {
      FormattingService.instance = new FormattingService();
    }
    return FormattingService.instance;
  }

  /**
   * 코드를 포맷팅합니다
   */
  async formatCode(
    code: string, 
    language: SupportedLanguage, 
    options?: PrettierOptions
  ): Promise<PrettierResult> {
    try {
      const prettierOptions = this.getPrettierOptions(language, options);
      
      if (!prettierOptions.parser) {
        // Prettier가 지원하지 않는 언어의 경우
        return {
          formatted: code,
          changed: false,
          diff: undefined
        };
      }

      const formatted = await prettier.format(code, prettierOptions);
      const changed = formatted !== code;

      return {
        formatted,
        changed,
        diff: changed ? this.generateDiff(code, formatted) : undefined
      };

    } catch (error) {
      console.error('코드 포매팅 오류:', error);
      
      // 에러가 발생한 경우 원본 코드 반환
      return {
        formatted: code,
        changed: false,
        diff: undefined
      };
    }
  }

  /**
   * 실시간 포맷팅 (타이핑 중)
   */
  async formatOnType(
    code: string,
    language: SupportedLanguage,
    cursorPosition: number
  ): Promise<{ formatted: string; newCursorPosition: number }> {
    try {
      const result = await this.formatCode(code, language);
      
      if (!result.changed) {
        return {
          formatted: code,
          newCursorPosition: cursorPosition
        };
      }

      // 커서 위치 조정 (간단한 휴리스틱)
      const newCursorPosition = this.adjustCursorPosition(
        code,
        result.formatted,
        cursorPosition
      );

      return {
        formatted: result.formatted,
        newCursorPosition
      };

    } catch (error) {
      return {
        formatted: code,
        newCursorPosition: cursorPosition
      };
    }
  }

  /**
   * 언어별 Prettier 옵션 설정
   */
  private getPrettierOptions(
    language: SupportedLanguage, 
    customOptions?: PrettierOptions
  ): PrettierOptions {
    const baseOptions: PrettierOptions = {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      quoteProps: 'as-needed',
      trailingComma: 'es5',
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      plugins: [parserBabel, parserTypeScript, parserPostcss, parserHtml],
      ...customOptions
    };

    switch (language) {
      case 'javascript':
        return {
          ...baseOptions,
          parser: 'babel',
        };

      case 'typescript':
        return {
          ...baseOptions,
          parser: 'typescript',
        };

      // 다른 언어들은 Prettier가 직접 지원하지 않음
      default:
        return {
          ...baseOptions,
          parser: undefined // 파서 없음을 명시
        };
    }
  }

  /**
   * 간단한 diff 생성
   */
  private generateDiff(original: string, formatted: string): string {
    const originalLines = original.split('\n');
    const formattedLines = formatted.split('\n');
    
    const diff: string[] = [];
    const maxLength = Math.max(originalLines.length, formattedLines.length);

    for (let i = 0; i < maxLength; i++) {
      const originalLine = originalLines[i];
      const formattedLine = formattedLines[i];

      if (originalLine !== formattedLine) {
        if (originalLine !== undefined) {
          diff.push(`- ${originalLine}`);
        }
        if (formattedLine !== undefined) {
          diff.push(`+ ${formattedLine}`);
        }
      }
    }

    return diff.join('\n');
  }

  /**
   * 포맷팅 후 커서 위치 조정
   */
  private adjustCursorPosition(
    original: string,
    formatted: string,
    originalPosition: number
  ): number {
    // 간단한 휴리스틱: 비율로 위치 조정
    const ratio = originalPosition / original.length;
    return Math.round(formatted.length * ratio);
  }

  /**
   * 언어가 Prettier를 지원하는지 확인
   */
  isLanguageSupported(language: SupportedLanguage): boolean {
    const supportedLanguages = [
      'javascript',
      'typescript'
    ];
    
    return supportedLanguages.includes(language);
  }

  /**
   * 사용자 설정 기본값 생성
   */
  getDefaultSettings(): PrettierOptions {
    return {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      quoteProps: 'as-needed',
      trailingComma: 'es5',
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid',
      endOfLine: 'lf'
    };
  }

  /**
   * 설정 유효성 검사
   */
  validateSettings(settings: Partial<PrettierOptions>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (settings.printWidth && (settings.printWidth < 20 || settings.printWidth > 200)) {
      errors.push('printWidth는 20-200 사이여야 합니다');
    }

    if (settings.tabWidth && (settings.tabWidth < 1 || settings.tabWidth > 10)) {
      errors.push('tabWidth는 1-10 사이여야 합니다');
    }

    if (settings.trailingComma && !['none', 'es5', 'all'].includes(settings.trailingComma)) {
      errors.push('trailingComma는 none, es5, all 중 하나여야 합니다');
    }

    if (settings.arrowParens && !['avoid', 'always'].includes(settings.arrowParens)) {
      errors.push('arrowParens는 avoid 또는 always여야 합니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default FormattingService;