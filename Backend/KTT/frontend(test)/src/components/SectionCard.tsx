import { PropsWithChildren, ReactNode } from "react";

interface SectionCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  footer?: ReactNode;
}

export function SectionCard({ title, description, footer, children }: SectionCardProps) {
  return (
    <section className="card">
      <header className="card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p className="card__description">{description}</p> : null}
        </div>
      </header>
      <div className="card__body">{children}</div>
      {footer ? <footer className="card__footer">{footer}</footer> : null}
    </section>
  );
}
