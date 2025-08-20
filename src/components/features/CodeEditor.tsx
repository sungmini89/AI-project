/**
 * Monaco Editor 통합 컴포넌트
 * 코드 편집, 구문 강조, 자동 완성 등의 기능을 제공
 * @module components/features/CodeEditor
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import MonacoEditor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { CodeEditorProps, SupportedLanguage } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";

/**
 * 언어 옵션 매핑
 * 지원되는 프로그래밍 언어와 표시명, 확장자 정보
 */
const LANGUAGE_OPTIONS: {
  value: SupportedLanguage;
  label: string;
  ext: string;
}[] = [
  { value: "javascript", label: "JavaScript", ext: ".js" },
  { value: "typescript", label: "TypeScript", ext: ".ts" },
  { value: "python", label: "Python", ext: ".py" },
  { value: "java", label: "Java", ext: ".java" },
  { value: "cpp", label: "C++", ext: ".cpp" },
  { value: "csharp", label: "C#", ext: ".cs" },
  { value: "go", label: "Go", ext: ".go" },
  { value: "rust", label: "Rust", ext: ".rs" },
  { value: "php", label: "PHP", ext: ".php" },
  { value: "ruby", label: "Ruby", ext: ".rb" },
  { value: "swift", label: "Swift", ext: ".swift" },
  { value: "kotlin", label: "Kotlin", ext: ".kt" },
];

/**
 * 샘플 코드 템플릿
 * 각 프로그래밍 언어별 기본 예시 코드
 */
const SAMPLE_CODE: Record<SupportedLanguage, string> = {
  javascript: `// JavaScript 코드 예시
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,

  typescript: `// TypeScript 코드 예시
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return {
    id: Math.random(),
    name,
    email
  };
}

const user = createUser("김개발", "kim@example.com");`,

  python: `# Python 코드 예시
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def main():
    result = fibonacci(10)
    print(f"피보나치 수: {result}")

if __name__ == "__main__":
    main()`,

  java: `// Java 코드 예시
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        int result = fibonacci(10);
        System.out.println("피보나치 수: " + result);
    }
}`,

  cpp: `// C++ 코드 예시
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int result = fibonacci(10);
    cout << "피보나치 수: " << result << endl;
    return 0;
}`,

  csharp: `// C# 코드 예시
using System;

class Program {
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
    
    static void Main() {
        int result = Fibonacci(10);
        Console.WriteLine($"피보나치 수: {result}");
    }
}`,

  go: `// Go 코드 예시
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    result := fibonacci(10)
    fmt.Printf("피보나치 수: %d\\n", result)
}`,

  rust: `// Rust 코드 예시
fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let result = fibonacci(10);
    println!("피보나치 수: {}", result);
}`,

  php: `<?php
// PHP 코드 예시
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

$result = fibonacci(10);
echo "피보나치 수: " . $result . PHP_EOL;
?>`,

  ruby: `# Ruby 코드 예시
def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

result = fibonacci(10)
puts "피보나치 수: #{result}"`,

  swift: `// Swift 코드 예시
func fibonacci(_ n: Int) -> Int {
    if n <= 1 { return n }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

let result = fibonacci(10)
print("피보나치 수: \\(result)")`,

  kotlin: `// Kotlin 코드 예시
fun fibonacci(n: Int): Int {
    return when (n) {
        0, 1 -> n
        else -> fibonacci(n - 1) + fibonacci(n - 2)
    }
}

fun main() {
    val result = fibonacci(10)
    println("피보나치 수: $result")
}`,
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  onLanguageChange,
  theme = "light",
  height = 500,
  readonly = false,
  showMinimap = true,
}) => {
  const { t } = useLanguage();
  const [editorInstance, setEditorInstance] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // 에디터 마운트 시 설정
  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      setEditorInstance(editor);
      setMonaco(monaco);
      monacoRef.current = monaco;

      // 에디터 설정
      editor.updateOptions({
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        lineNumbers: "on",
        wordWrap: "on",
        minimap: { enabled: showMinimap },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        formatOnType: true,
        formatOnPaste: true,
      });

      // 키보드 단축키 설정
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Ctrl+S 또는 Cmd+S로 코드 포매팅
        editor.trigger("keyboard", "editor.action.formatDocument", {});
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
        // Ctrl+K 또는 Cmd+K로 명령 팔레트
        editor.trigger("keyboard", "editor.action.quickCommand", {});
      });
    },
    [showMinimap]
  );

  // 언어별 Monaco 설정
  useEffect(() => {
    if (!monaco) return;

    // TypeScript 컴파일러 옵션 설정
    if (language === "typescript") {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        allowJs: true,
        strict: true,
      });
    }

    // JavaScript 컴파일러 옵션 설정
    if (language === "javascript") {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        allowJs: true,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
      });
    }
  }, [monaco, language]);

  // 언어 변경 핸들러
  const handleLanguageChange = useCallback(
    (newLanguage: SupportedLanguage) => {
      onLanguageChange(newLanguage);

      // 언어가 변경될 때 샘플 코드 로드 (현재 코드가 비어있을 때만)
      if (!value.trim()) {
        onChange(SAMPLE_CODE[newLanguage] || "");
      }
    },
    [value, onChange, onLanguageChange]
  );

  // 샘플 코드 로드
  const handleLoadSample = useCallback(() => {
    onChange(SAMPLE_CODE[language] || "");
  }, [language, onChange]);

  // 코드 포매팅
  const handleFormatCode = useCallback(() => {
    if (editorInstance) {
      editorInstance.trigger("keyboard", "editor.action.formatDocument", {});
    }
  }, [editorInstance]);

  // 코드 지우기
  const handleClearCode = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="flex flex-col h-full">
      {/* 툴바 */}
      <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center space-x-4">
          {/* 언어 선택 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              {t("editor.language")}:
            </label>
            <select
              value={language}
              onChange={(e) =>
                handleLanguageChange(e.target.value as SupportedLanguage)
              }
              className="input-field text-sm min-w-[120px]"
              disabled={readonly}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 파일 확장자 표시 */}
          <div className="text-sm text-secondary-500">
            {LANGUAGE_OPTIONS.find((opt) => opt.value === language)?.ext}
          </div>
        </div>

        {/* 액션 버튼들 */}
        {!readonly && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLoadSample}
              className="btn-secondary text-sm"
              title={t("editor.sample")}
            >
              📄 {t("editor.sample")}
            </button>
            <button
              onClick={handleFormatCode}
              className="btn-secondary text-sm"
              title={t("editor.formatting")}
            >
              ✨ {t("editor.formatting")}
            </button>
            <button
              onClick={handleClearCode}
              className="btn-secondary text-sm text-red-600 hover:bg-red-50"
              title={t("editor.clear")}
            >
              🗑️ {t("editor.clear")}
            </button>
          </div>
        )}
      </div>

      {/* 에디터 */}
      <div className="flex-1" style={{ height: `${height}px` }}>
        <MonacoEditor
          value={value}
          language={language}
          theme={theme === "dark" ? "vs-dark" : "vs-light"}
          onChange={(newValue) => onChange(newValue || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly: readonly,
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: "line",
            automaticLayout: true,
          }}
        />
      </div>

      {/* 상태 표시 */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary-50 dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 text-sm text-secondary-600 dark:text-secondary-400">
        <div className="flex items-center space-x-4">
          <span>
            {t("editor.line")}: {value.split("\n").length}
          </span>
          <span>
            {t("editor.character")}: {value.length}
          </span>
          {language && (
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>
                {LANGUAGE_OPTIONS.find((opt) => opt.value === language)?.label}
              </span>
            </span>
          )}
        </div>

        {readonly && (
          <span className="text-amber-600 dark:text-amber-400">
            {t("editor.readonly")}
          </span>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
