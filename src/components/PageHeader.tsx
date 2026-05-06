import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl md:text-4xl font-semibold gold-text">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
