"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface Item {
  year: string;
  title: string;
  detail?: string;
  meta?: string;
}

interface Props {
  items: Item[];
  className?: string;
}

export const Timeline = ({ items, className }: Props) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ol className={cn("not-prose !my-8 !ml-0 grid gap-0 !p-0 !list-none", className)}>
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <li key={`${item.year}-${item.title}`} className="!m-0 list-none border-border border-t last:border-b">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              className="grid w-full grid-cols-[4.5rem_1fr_1.5rem] items-baseline gap-4 py-3 text-left transition-colors hover:text-accent"
              aria-expanded={isOpen}
            >
              <span className="font-mono text-[11px] text-muted uppercase tracking-[0.08em]">{item.year}</span>
              <span className="text-foreground">{item.title}</span>
              <span aria-hidden className={cn("text-muted text-small transition-transform", isOpen ? "rotate-45" : "rotate-0")}>
                +
              </span>
            </button>
            <div className={cn("grid overflow-hidden transition-[grid-template-rows] duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="min-h-0">
                {item.detail && (
                  <div className="grid grid-cols-[4.5rem_1fr_1.5rem] gap-4 pb-4">
                    <span aria-hidden className="text-muted text-small">
                      {item.meta ?? ""}
                    </span>
                    <p className="!m-0 max-w-[60ch] text-muted text-small leading-relaxed">{item.detail}</p>
                    <span aria-hidden />
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
