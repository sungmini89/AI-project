import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AnalysisResult } from '@/types/analysis';
import type { EnhancedAnalysisResult } from './ai-enhanced-analysis';

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  filename?: string;
  includeDetails?: boolean;
}

export class ExportService {
  static async exportAnalysisResults(
    result: AnalysisResult | EnhancedAnalysisResult,
    options: ExportOptions
  ): Promise<void> {
    const { format, filename, includeDetails = true } = options;
    const baseFilename = filename || `매칭분석결과_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'pdf':
        await this.exportToPDF(result, `${baseFilename}.pdf`, includeDetails);
        break;
      case 'json':
        this.exportToJSON(result, `${baseFilename}.json`);
        break;
      case 'csv':
        this.exportToCSV(result, `${baseFilename}.csv`);
        break;
      default:
        throw new Error(`지원하지 않는 형식입니다: ${format}`);
    }
  }

  static async exportToPDF(
    result: AnalysisResult | EnhancedAnalysisResult,
    filename: string,
    includeDetails: boolean
  ): Promise<void> {
    try {
      // PDF 생성을 위한 HTML 콘텐츠 생성
      const htmlContent = this.generateHTMLContent(result, includeDetails);
      
      // 임시 div 생성하여 HTML 콘텐츠 렌더링
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      
      document.body.appendChild(tempDiv);

      // HTML을 Canvas로 변환
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Canvas를 PDF로 변환
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 170; // A4 width minus margins
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20;

      // 첫 번째 페이지 추가
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 40);

      // 여러 페이지가 필요한 경우 처리
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 20;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 40);
      }

      // PDF 다운로드
      pdf.save(filename);

      // 임시 요소 제거
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('PDF 내보내기 실패:', error);
      throw new Error('PDF 생성에 실패했습니다.');
    }
  }

  static exportToJSON(result: AnalysisResult | EnhancedAnalysisResult, filename: string): void {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        analysisResults: result,
        metadata: {
          version: '1.0',
          type: 'resume-job-matching-analysis'
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      this.downloadFile(jsonString, filename, 'application/json');
    } catch (error) {
      console.error('JSON 내보내기 실패:', error);
      throw new Error('JSON 생성에 실패했습니다.');
    }
  }

  static exportToCSV(result: AnalysisResult | EnhancedAnalysisResult, filename: string): void {
    try {
      const csvData = [
        ['항목', '점수 (%)', '세부 정보'],
        ['전체 매칭 점수', result.overallScore.toString(), '종합 매칭률'],
        ['키워드 매칭', result.breakdown.keywordMatches.matchRate.toString(), `매칭 키워드: ${result.breakdown.keywordMatches.matchedKeywords.join(', ')}`],
        ['스킬 매칭', result.breakdown.skillMatches.overallSkillMatch.toString(), `매칭된 스킬: ${result.breakdown.skillMatches.matchedSkills.map(s => s.name).join(', ')}`],
        ['ATS 호환성', result.breakdown.atsCompliance.score.toString(), result.breakdown.atsCompliance.issues.join(', ') || '문제 없음'],
        ['', '', ''],
        ['개선 제안', '', ''],
        ...result.suggestions.map(suggestion => [
          suggestion.title,
          suggestion.priority === 'high' ? '높음' : suggestion.priority === 'medium' ? '보통' : '낮음',
          suggestion.description
        ])
      ];

      // AI 인사이트가 있는 경우 추가
      if ('aiInsights' in result) {
        csvData.push(
          ['', '', ''],
          ['AI 인사이트', '', ''],
          ['신뢰도', result.aiInsights.confidenceScore.toString(), result.aiInsights.provider],
          ['요약', '', result.aiInsights.summary],
          ...result.aiInsights.strengths.map(strength => ['강점', '', strength]),
          ...result.aiInsights.weaknesses.map(weakness => ['개선영역', '', weakness]),
          ...result.aiInsights.recommendations.map(rec => ['AI 추천', '', rec])
        );
      }

      const csvString = csvData.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // BOM 추가 (Excel에서 한글 깨짐 방지)
      const bom = '\uFEFF';
      this.downloadFile(bom + csvString, filename, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      throw new Error('CSV 생성에 실패했습니다.');
    }
  }

  private static generateHTMLContent(
    result: AnalysisResult | EnhancedAnalysisResult,
    includeDetails: boolean
  ): string {
    const date = new Date().toLocaleDateString('ko-KR');
    const isEnhanced = 'aiInsights' in result;

    return `
      <div style="font-family: 'Malgun Gothic', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 24px; font-weight: bold;">이력서 채용공고 매칭 분석 보고서</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">생성일: ${date}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px;">📊 종합 분석 결과</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <div style="text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: ${result.overallScore >= 70 ? '#22c55e' : result.overallScore >= 50 ? '#f59e0b' : '#ef4444'};">
                ${result.overallScore}%
              </div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">전체 매칭 점수</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px;">📈 세부 분석</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">키워드 매칭</h3>
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${result.breakdown.keywordMatches.matchRate}%</div>
            </div>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">스킬 매칭</h3>
              <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${result.breakdown.skillMatches.overallSkillMatch}%</div>
            </div>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">ATS 호환성</h3>
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${result.breakdown.atsCompliance.score}%</div>
            </div>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">처리 시간</h3>
              <div style="font-size: 18px; font-weight: bold; color: #10b981;">${result.processingTime}ms</div>
            </div>
          </div>
        </div>

        ${result.breakdown.keywordMatches.matchedKeywords.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px;">✅ 매칭된 키워드</h2>
          <div style="margin: 15px 0;">
            ${result.breakdown.keywordMatches.matchedKeywords.map(keyword => 
              `<span style="display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; margin: 4px; border-radius: 20px; font-size: 12px;">${keyword}</span>`
            ).join('')}
          </div>
        </div>
        ` : ''}

        ${result.breakdown.keywordMatches.importantMissing.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px;">⚠️ 중요 누락 키워드</h2>
          <div style="margin: 15px 0;">
            ${result.breakdown.keywordMatches.importantMissing.map(keyword => 
              `<span style="display: inline-block; background: #fed7d7; color: #c53030; padding: 4px 12px; margin: 4px; border-radius: 20px; font-size: 12px;">${keyword}</span>`
            ).join('')}
          </div>
        </div>
        ` : ''}

        ${includeDetails && result.suggestions.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px;">💡 개선 제안</h2>
          ${result.suggestions.map(suggestion => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background: ${
                  suggestion.priority === 'high' ? '#fef2f2' : 
                  suggestion.priority === 'medium' ? '#fffbeb' : '#f0f9ff'
                }; color: ${
                  suggestion.priority === 'high' ? '#dc2626' : 
                  suggestion.priority === 'medium' ? '#d97706' : '#2563eb'
                }; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-right: 10px;">${
                  suggestion.priority === 'high' ? '높음' : 
                  suggestion.priority === 'medium' ? '보통' : '낮음'
                }</span>
                <h3 style="margin: 0; font-size: 16px; color: #374151;">${suggestion.title}</h3>
              </div>
              <p style="color: #6b7280; margin: 10px 0; font-size: 14px; line-height: 1.5;">${suggestion.description}</p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #374151; font-size: 14px;">
                ${suggestion.actionItems.map(item => `<li style="margin: 5px 0;">${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${isEnhanced && includeDetails ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px;">🤖 AI 인사이트</h2>
          <div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="font-weight: bold; color: #374151;">분석 제공: ${result.aiInsights.provider}</span>
              <span style="color: ${result.aiInsights.confidenceScore >= 80 ? '#22c55e' : result.aiInsights.confidenceScore >= 60 ? '#f59e0b' : '#ef4444'}; font-weight: bold;">
                신뢰도: ${result.aiInsights.confidenceScore}%
              </span>
            </div>
            <p style="color: #374151; margin: 15px 0; font-size: 14px; line-height: 1.6; background: white; padding: 15px; border-radius: 6px;">${result.aiInsights.summary}</p>
            
            ${result.aiInsights.strengths.length > 0 ? `
            <div style="margin: 20px 0;">
              <h4 style="color: #22c55e; font-size: 14px; margin-bottom: 10px;">주요 강점</h4>
              ${result.aiInsights.strengths.map(strength => 
                `<div style="background: #dcfce7; color: #166534; padding: 10px; margin: 5px 0; border-radius: 6px; font-size: 13px;">• ${strength}</div>`
              ).join('')}
            </div>
            ` : ''}
            
            ${result.aiInsights.weaknesses.length > 0 ? `
            <div style="margin: 20px 0;">
              <h4 style="color: #f59e0b; font-size: 14px; margin-bottom: 10px;">개선 영역</h4>
              ${result.aiInsights.weaknesses.map(weakness => 
                `<div style="background: #fef3c7; color: #92400e; padding: 10px; margin: 5px 0; border-radius: 6px; font-size: 13px;">• ${weakness}</div>`
              ).join('')}
            </div>
            ` : ''}
            
            ${result.aiInsights.recommendations.length > 0 ? `
            <div style="margin: 20px 0;">
              <h4 style="color: #3b82f6; font-size: 14px; margin-bottom: 10px;">AI 추천사항</h4>
              ${result.aiInsights.recommendations.map(rec => 
                `<div style="background: #dbeafe; color: #1e40af; padding: 10px; margin: 5px 0; border-radius: 6px; font-size: 13px;">• ${rec}</div>`
              ).join('')}
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>이 보고서는 AI 기반 이력서 채용공고 매칭 분석 플랫폼에서 생성되었습니다.</p>
          <p>분석 결과는 참고용이며, 실제 채용 결정에는 다양한 요소를 고려해야 합니다.</p>
        </div>
      </div>
    `;
  }

  private static downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }
}

export default ExportService;