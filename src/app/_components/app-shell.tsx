"use client";

import { useState, type ReactNode } from "react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="app-shell"><AppSidebar open={open} close={() => setOpen(false)} /><div className="app-column"><AppHeader openMenu={() => setOpen(true)} /><div className="page-container">{children}</div></div></div>;
}
