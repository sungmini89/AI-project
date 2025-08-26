import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, File, Table, Loader2 } from 'lucide-react';
import { ExportService, type ExportOptions } from '@/services/export-service';
import type { AnalysisResult } from '@/types/analysis';
import type { EnhancedAnalysisResult } from '@/services/ai-enhanced-analysis';

interface ExportButtonProps {
  result: AnalysisResult | EnhancedAnalysisResult;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ result, className }) => {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: ExportOptions['format'], includeDetails: boolean = true) => {
    setExporting(format);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `매칭분석_${timestamp}`;
      
      await ExportService.exportAnalysisResults(result, {
        format,
        filename: baseFilename,
        includeDetails
      });
      
      // 성공 알림 (간단한 토스트 메시지 대신)
      console.log(`${format.toUpperCase()} 내보내기 완료`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('내보내기에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setExporting(null);
    }
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {exporting.toUpperCase()} 생성 중...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              결과 내보내기
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex-1">
            <div className="font-medium">PDF 보고서</div>
            <div className="text-xs text-muted-foreground">완전한 분석 보고서</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          disabled={!!exporting}
          className="cursor-pointer"
        >
          <File className="h-4 w-4 mr-2" />
          <div className="flex-1">
            <div className="font-medium">JSON 데이터</div>
            <div className="text-xs text-muted-foreground">원시 분석 데이터</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={!!exporting}
          className="cursor-pointer"
        >
          <Table className="h-4 w-4 mr-2" />
          <div className="flex-1">
            <div className="font-medium">CSV 스프레드시트</div>
            <div className="text-xs text-muted-foreground">Excel에서 열기 가능</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleExport('pdf', false)}
          disabled={!!exporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex-1">
            <div className="font-medium">PDF 요약본</div>
            <div className="text-xs text-muted-foreground">핵심 점수만 포함</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};