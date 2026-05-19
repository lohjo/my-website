import type { MDXComponents } from "mdx/types";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";
import { BreakthroughCurve } from "@/components/breakthrough-curve";
import { CodeBlock } from "@/components/code-block";
import FootnoteBackReference from "@/components/footnote/back-reference";
import FootnoteForwardReference from "@/components/footnote/forward-reference";
import MDXImage from "@/components/image";
import Link from "@/components/link";
import Preview from "@/components/preview";
import { ProjectCard } from "@/components/project-card";
import { TechStack } from "@/components/tech-stack";
import { Timeline } from "@/components/timeline";
import { cn } from "@/lib/cn";

const components: MDXComponents = {
  PreviewExample: () => {
    return (
      <div className="flex h-10 w-32 items-center justify-center rounded-lg border border-amber-6 bg-amber-3 text-amber-11">
        <div className="overflow-x-auto">
          <div className="min-w-full">Showcase</div>
        </div>
      </div>
    );
  },
  Preview: ({ children, codeblock }) => <Preview codeblock={codeblock ? codeblock : undefined}>{children}</Preview>,
  Image: ({ caption, alt, ...props }) => <MDXImage {...props} caption={caption} alt={alt} />,
  TechStack,
  ProjectCard,
  Timeline,
  BreakthroughCurve,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <CodeBlock {...props} />,
  h2: ({ children, id }: React.HTMLAttributes<HTMLHeadingElement>) => {
    if (id?.includes("footnote-label")) {
      return null;
    }
    return <h2 id={id}>{children}</h2>;
  },
  a: ({ children, href }) => {
    if (href?.startsWith("#user-content-fn-")) {
      return <FootnoteForwardReference href={href}>{children}</FootnoteForwardReference>;
    }
    return (
      <Link href={href} className="inline-flex items-center gap-1 text-accent transition-colors" underline>
        {children}
      </Link>
    );
  },
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn("my-6 max-w-[60ch] font-serif text-[1.05rem] text-foreground italic leading-relaxed", className)} {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-hidden overflow-y-auto">
      <table className={cn("w-full overflow-hidden", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => {
    if (React.Children.toArray(props.children).some((child) => React.isValidElement<{ id?: string }>(child) && child.props.id?.includes("user-content-fn-"))) {
      return (
        <ol data-footnotes>
          <div className="mt-6 mb-2 text-muted text-small">Footnotes</div>
          {props.children}
        </ol>
      );
    }
    return <ol className={cn("mt-2 ml-2 list-decimal", className)} {...props} />;
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className={cn("mt-2 ml-2 list-disc", className)} {...props} />,
  li: ({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) => {
    if (props.id?.includes("user-content-fn-")) {
      return (
        <li id={props.id}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement<{ children?: React.ReactNode[] }>(child)) {
              if (child.type === "p") {
                const childArr = (child.props.children ?? []) as React.ReactNode[];
                const findRef = (c: React.ReactNode) => React.isValidElement<{ href?: string }>(c) && (c.props.href?.includes("user-content-fnref-") ?? false);
                const refNode = childArr.find(findRef) as React.ReactElement<{ href?: string }> | undefined;
                const href = refNode?.props.href ?? "";
                const filtered = childArr.filter((c) => !findRef(c));
                return <FootnoteBackReference href={href}>{filtered}</FootnoteBackReference>;
              }
              return child;
            }
            return child;
          })}
        </li>
      );
    }
    return <li className={cn("mt-2 ml-2 list-item", className)}>{children}</li>;
  },
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}

export function MDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypePrettyCode,
              {
                theme: {
                  dark: "github-dark",
                  light: "github-light",
                },
                keepBackground: false,
                defaultLang: "tsx",
              },
            ],
          ] as PluggableList,
        },
      }}
    />
  );
}
