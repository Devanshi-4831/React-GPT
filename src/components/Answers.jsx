//components/Answers.jsx

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Pencil } from "lucide-react";

function Answer({
  ans,
  theme = "dark",
  isQuestion = false,
  onEdit,
}) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(ans);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    // ✅ OUTER WRAPPER (controls hover)
    <div className="group w-full">
      
      {/* ✅ MESSAGE CONTENT ONLY */}
      <div
        className={`w-full text-left leading-relaxed
        text-[14px] sm:text-[15px] md:text-[16px]
        ${theme === "dark" ? "text-zinc-100" : "text-zinc-900"}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children }) {
              return <p className="mb-3 last:mb-0">{children}</p>;
            },

            ul({ children }) {
              return (
                <ul className="list-disc ml-6 mb-3 space-y-1">
                  {children}
                </ul>
              );
            },

            ol({ children }) {
              return (
                <ol className="list-decimal ml-6 mb-3 space-y-1">
                  {children}
                </ol>
              );
            },

            li({ children }) {
              return <li className="leading-relaxed">{children}</li>;
            },

            code({ inline, className, children }) {
              const match = /language-(\w+)/.exec(className || "");

              if (!inline && match) {
                return (
                  <div
                    className={`my-3 overflow-x-auto rounded-xl border
                    ${theme === "dark" ? "border-zinc-700" : "border-zinc-300"}`}
                  >
                    <SyntaxHighlighter
                      style={theme === "dark" ? atomDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      className="text-sm rounded-xl"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              return (
                <code
                  className={`px-1 py-0.5 rounded text-sm font-mono
                  ${
                    theme === "dark"
                      ? "bg-zinc-700 text-zinc-100"
                      : "bg-zinc-200 text-zinc-900"
                  }`}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {ans}
        </ReactMarkdown>
      </div>

      {/* ✅ ACTION BAR — BELOW MESSAGE, NOT MERGED */}
      <div
        className={`mt-2 flex items-center gap-2
        opacity-0 group-hover:opacity-100 transition-opacity
        ${isQuestion ? "justify-end" : "justify-start"}`}
      >
        {/* COPY — Assistant */}
        {/* {!isQuestion && (
          <button
            onClick={copyText}
            className={`p-1.5 rounded-md border
              ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  : "bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            aria-label="Copy"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )} */}

        {/* EDIT — User */}
        {isQuestion && (
          <button
            onClick={onEdit}
            className={`p-1.5 rounded-md border
              ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  : "bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Answer;
