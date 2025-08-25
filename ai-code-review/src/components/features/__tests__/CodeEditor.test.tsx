/**
 * CodeEditor 컴포넌트 테스트
 * 코드 에디터 컴포넌트의 기능과 동작을 검증하는 테스트 스위트
 * @module components/features/__tests__/CodeEditor.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CodeEditor from "../CodeEditor";
import type { SupportedLanguage } from "../../../types";

/**
 * Monaco Editor 모킹
 * 실제 Monaco Editor 대신 간단한 textarea로 대체하여 테스트 환경에서 사용
 */
vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

/**
 * useLanguage 훅 모킹
 * 다국어 지원을 시뮬레이션하여 테스트에서 사용
 */
vi.mock("../../../hooks/useLanguage", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

/**
 * CodeEditor 컴포넌트 테스트 스위트
 * 컴포넌트의 렌더링, 이벤트 처리, 상태 변경 등을 검증
 */
describe("CodeEditor", () => {
  /** 기본 테스트 Props */
  const defaultProps = {
    value: 'console.log("test");',
    language: "javascript" as SupportedLanguage,
    onChange: vi.fn(),
    onLanguageChange: vi.fn(),
  };

  /**
   * 에디터가 초기값과 함께 렌더링되는지 테스트
   */
  it("should render editor with initial value", () => {
    render(<CodeEditor {...defaultProps} />);

    const editor = screen.getByTestId("monaco-editor");
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue('console.log("test");');
  });

  /**
   * 에디터 값 변경 시 onChange 콜백이 호출되는지 테스트
   */
  it("should call onChange when editor value changes", () => {
    const onChange = vi.fn();
    render(<CodeEditor {...defaultProps} onChange={onChange} />);

    const editor = screen.getByTestId("monaco-editor");
    fireEvent.change(editor, { target: { value: "new code" } });

    expect(onChange).toHaveBeenCalledWith("new code");
  });

  /**
   * 언어 선택기 변경 시 onLanguageChange 콜백이 호출되는지 테스트
   */
  it("should call onLanguageChange when language selector changes", () => {
    const onLanguageChange = vi.fn();
    render(
      <CodeEditor {...defaultProps} onLanguageChange={onLanguageChange} />
    );

    const languageSelect = screen.getByDisplayValue("JavaScript");
    fireEvent.change(languageSelect, { target: { value: "python" } });

    expect(onLanguageChange).toHaveBeenCalledWith("python");
  });

  /**
   * 읽기 전용 모드일 때 읽기 전용 표시가 나타나는지 테스트
   */
  it("should show readonly indicator when readonly is true", () => {
    render(<CodeEditor {...defaultProps} readonly={true} />);

    expect(screen.getByText("editor.readonly")).toBeInTheDocument();
  });

  /**
   * 읽기 전용 모드일 때 액션 버튼들이 비활성화되는지 테스트
   */
  it("should disable action buttons when readonly", () => {
    render(<CodeEditor {...defaultProps} readonly={true} />);

    const sampleButton = screen.queryByText("📄 editor.sample");
    expect(sampleButton).not.toBeInTheDocument();
  });

  /**
   * 올바른 파일 확장자가 표시되는지 테스트
   */
  it("should display correct file extension", () => {
    render(<CodeEditor {...defaultProps} language="typescript" />);

    expect(screen.getByText(".ts")).toBeInTheDocument();
  });
});
