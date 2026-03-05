interface BreadcrumbNavProps {
  category: string;
  subPage: string;
  functionTab: string;
}

export function BreadcrumbNav({ category, subPage, functionTab }: BreadcrumbNavProps) {
  const crumbs = [category, subPage, functionTab].filter(Boolean);
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          <span>{crumb}</span>
        </span>
      ))}
    </div>
  );
}
