import { Link as NextViewTransition } from "next-view-transitions";
import { cn } from "@/lib/cn";

interface Props {
  href: string;
  title: string;
  summary: string;
  tags?: string[];
  meta?: string;
  className?: string;
}

export const ProjectCard = ({ href, title, summary, tags, meta, className }: Props) => {
  return (
    <NextViewTransition
      href={href}
      className={cn("group not-prose flex flex-col gap-2 border-border border-b py-4 transition-colors hover:border-accent", className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="!m-0 font-serif text-[1.05rem] text-foreground transition-colors group-hover:text-accent">{title}</h3>
        {meta && <span className="shrink-0 font-mono text-[11px] text-muted uppercase tracking-[0.08em]">{meta}</span>}
      </div>
      <p className="!m-0 text-muted text-small leading-snug">{summary}</p>
      {tags && tags.length > 0 && (
        <ul className="!m-0 flex flex-wrap gap-x-3 gap-y-0 p-0">
          {tags.map((tag) => (
            <li key={tag} className="!m-0 list-none font-mono text-[11px] text-muted">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </NextViewTransition>
  );
};
