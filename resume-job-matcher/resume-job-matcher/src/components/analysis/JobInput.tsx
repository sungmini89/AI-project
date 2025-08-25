/**
 * @fileoverview 채용공고 입력 컴포넌트
 * @description 사용자가 분석할 채용공고 텍스트를 입력할 수 있는 컴포넌트입니다.
 * 텍스트 입력, 자동 저장, 샘플 텍스트 로드, 텍스트 지우기 등의 기능을 제공하며,
 * 로컬스토리지를 사용하여 입력 내용을 자동으로 저장합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Save, Trash2 } from "lucide-react";

/**
 * 채용공고 입력 컴포넌트의 속성 인터페이스
 * @description 컴포넌트가 받을 수 있는 props를 정의합니다.
 */
interface JobInputProps {
  /** 텍스트 변경 시 호출되는 콜백 함수 */
  onTextChange?: (text: string) => void;
  /** 초기 텍스트 값 */
  initialText?: string;
}

/**
 * 채용공고 입력 컴포넌트
 * @description 분석할 채용공고 텍스트를 입력하고 관리하는 기능을 제공합니다.
 * 자동 저장, 샘플 텍스트 로드, 텍스트 지우기 등의 기능을 포함합니다.
 *
 * @param {JobInputProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 채용공고 입력 컴포넌트
 *
 * @example
 * ```tsx
 * <JobInput
 *   onTextChange={(text) => setJobText(text)}
 *   initialText="초기 채용공고 텍스트"
 * />
 * ```
 */
export const JobInput: React.FC<JobInputProps> = ({
  onTextChange,
  initialText = "",
}) => {
  const [text, setText] = useState(initialText);
  const [charCount, setCharCount] = useState(initialText.length);
  const [saved, setSaved] = useState(false);

  /**
   * 텍스트 자동 저장 효과
   * @description 텍스트가 변경되면 1초 후에 로컬스토리지에 자동으로 저장합니다.
   * 저장 완료 표시를 2초간 보여줍니다.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== initialText) {
        localStorage.setItem("jobDescription", text);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text, initialText]);

  /**
   * 초기 텍스트 로드 효과
   * @description 컴포넌트 마운트 시 로컬스토리지에서 저장된 텍스트를 불러옵니다.
   * initialText가 제공되지 않은 경우에만 로컬스토리지에서 로드합니다.
   */
  useEffect(() => {
    // 컴포넌트 마운트 시 로컬스토리지에서 불러오기
    const savedText = localStorage.getItem("jobDescription");
    if (savedText && !initialText) {
      setText(savedText);
      setCharCount(savedText.length);
    }
  }, [initialText]);

  /**
   * 텍스트 변경 처리 함수
   * @description 텍스트 입력 시 상태를 업데이트하고 콜백을 호출합니다.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - 텍스트 변경 이벤트
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
    onTextChange?.(newText);
    setSaved(false);
  };

  /**
   * 텍스트 지우기 함수
   * @description 입력된 텍스트를 모두 지우고 로컬스토리지에서도 제거합니다.
   */
  const clearText = () => {
    setText("");
    setCharCount(0);
    localStorage.removeItem("jobDescription");
    onTextChange?.("");
  };

  /**
   * 샘플 텍스트 로드 함수
   * @description 프론트엔드 개발자 채용공고 샘플 텍스트를 로드합니다.
   * 실제 사용 시에는 다양한 직무의 샘플을 제공할 수 있습니다.
   */
  const loadSampleText = () => {
    const sampleJob = `[회사명] 프론트엔드 개발자 채용

📋 주요업무:
- React, TypeScript를 활용한 웹 애플리케이션 개발
- 반응형 웹 디자인 및 크로스브라우저 호환성 구현
- RESTful API 연동 및 상태관리 (Redux, Zustand)
- 사용자 경험(UX) 최적화 및 성능 개선
- 디자인 시스템 구축 및 컴포넌트 라이브러리 개발

🔧 필수요건:
- React, TypeScript 3년 이상 실무 경험
- HTML5, CSS3, JavaScript(ES6+) 숙련
- Git 버전관리 시스템 활용 능력
- 웹 표준 및 접근성 가이드라인 이해

🎯 우대사항:
- Next.js, Vite 등 모던 프레임워크 경험
- Tailwind CSS, Styled-components 경험
- Jest, Cypress 등 테스팅 프레임워크 경험
- AWS, Vercel 등 클라우드 배포 경험
- 디자인 도구 (Figma, Sketch) 활용 가능자

💡 혜택:
- 경쟁력 있는 연봉 및 스톡옵션
- 자율적인 근무 환경 및 유연근무제
- 최신 개발 장비 및 도구 지원
- 교육비 및 컨퍼런스 참석 지원`;

    setText(sampleJob);
    setCharCount(sampleJob.length);
    onTextChange?.(sampleJob);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          채용공고 입력
        </CardTitle>
        <CardDescription>분석할 채용공고 내용을 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="채용공고 내용을 입력하세요...

예시:
- 주요 업무 및 책임
- 필수 요구사항
- 우대사항
- 회사 소개 등"
            className="w-full min-h-[200px] p-4 border border-input rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            style={{ minHeight: "200px" }}
          />

          {saved && (
            <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Save className="h-3 w-3" />
              자동 저장됨
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{charCount.toLocaleString()}자</span>
          <span
            className={charCount < 100 ? "text-orange-500" : "text-green-600"}
          >
            {charCount < 100
              ? "더 자세한 내용을 입력하면 분석 정확도가 향상됩니다"
              : "분석 준비 완료"}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSampleText} className="flex-1">
            샘플 채용공고 불러오기
          </Button>
          {text && (
            <Button variant="outline" onClick={clearText} size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {text && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>분석 팁:</strong> 구체적인 기술 스택, 경험 요구사항,
              우대사항을 명시하면 더 정확한 매칭 분석을 받을 수 있습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
