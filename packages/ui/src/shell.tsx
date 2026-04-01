import type { ReactNode } from "react";

type ShellProps = {
  children: ReactNode;
};

export function SurfaceGrid() {
  return <div aria-hidden="true" className="surface-grid" />;
}

export function PageShell({ children }: ShellProps) {
  return <div className="page-shell">{children}</div>;
}
