"use client";

import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { StreamLanguage } from "@codemirror/language";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { EditorView } from "@codemirror/view";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

const customTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
  },
  ".cm-content": {
    padding: "12px 0",
  },
  ".cm-gutters": {
    background: "#0d1117",
    borderRight: "1px solid #1e2a4a",
    color: "#475569",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 12px 0 8px",
    minWidth: "40px",
  },
  ".cm-activeLine": {
    background: "rgba(255,255,255,0.03)",
  },
  ".cm-activeLineGutter": {
    background: "rgba(255,255,255,0.05)",
  },
  ".cm-cursor": {
    borderLeftColor: "#b91c1c",
  },
  ".cm-selectionBackground": {
    background: "rgba(59, 130, 246, 0.3) !important",
  },
});

export default function CodeEditor({ value, onChange, height = "400px", readOnly = false }: CodeEditorProps) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border-default)" }}
    >
      <CodeMirror
        value={value}
        height={height}
        extensions={[StreamLanguage.define(ruby), customTheme]}
        theme={oneDark}
        onChange={onChange}
        readOnly={readOnly}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: false,
          drawSelection: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: false,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: false,
          historyKeymap: true,
          foldKeymap: false,
          completionKeymap: false,
          lintKeymap: false,
        }}
      />
    </div>
  );
}
