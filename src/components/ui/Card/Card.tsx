interface CardProps {
  title: string;
  description?: string;
  variant?: "default" | "highlighted";
  children?: React.ReactNode;
}

export function Card({ title, description, variant = "default", children }: CardProps) {
  return (
    <div className={`card card--${variant}`}>
      <h3 className="card__title">{title}</h3>
      {description && <p className="card__description">{description}</p>}
      {children && <div className="card__content">{children}</div>}
    </div>
  );
}
