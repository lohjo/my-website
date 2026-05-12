"use client";

import type React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface Props extends React.HTMLAttributes<HTMLPreElement> {
  "data-language"?: string;
}

export const CodeBlock = ({ className, children, ...rest }: Props) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = rest["data-language"];

  const onCopy = async () => {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-base border border-border bg-background">
      <div className="flex items-center justify-between border-border border-b px-3 py-1.5">
        <span className="font-mono text-[10.5px] text-muted uppercase tracking-[0.1em]">{language ?? "code"}</span>
        <button
          type="button"
          onClick={onCopy}
          className="font-mono text-[10.5px] text-muted uppercase tracking-[0.1em] transition-colors hover:text-accent"
          aria-label="Copy code"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre ref={ref} className={cn("!m-0 !rounded-none !border-0 !bg-transparent", className)} {...rest}>
        {children}
      </pre>
    </div>
  );
};
