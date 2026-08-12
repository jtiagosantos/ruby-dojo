"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ModuleContentProps {
  content: string;
}

export default function ModuleContent({ content }: ModuleContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
