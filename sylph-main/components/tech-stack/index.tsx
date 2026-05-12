import { cn } from "@/lib/cn";

interface Group {
  label: string;
  items: string[];
}

interface Props {
  groups: Group[];
  className?: string;
}

export const TechStack = ({ groups, className }: Props) => {
  return (
    <div className={cn("not-prose my-8 grid gap-6", className)}>
      {groups.map((group) => (
        <div key={group.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-x-4 gap-y-1">
          <div className="text-muted text-small uppercase tracking-[0.08em]">{group.label}</div>
          <ul className="m-0 flex flex-wrap gap-x-3 gap-y-1 p-0 text-default">
            {group.items.map((item) => (
              <li key={item} className="!m-0 list-none font-mono text-[12.5px] text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
