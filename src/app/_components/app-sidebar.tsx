"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, BrainCircuit, ClipboardList, GraduationCap, LayoutDashboard, Layers3, Settings, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/vocabulary", label: "Từ vựng theo ngày", icon: Layers3 },
  { href: "/learn", label: "Học từ vựng", icon: GraduationCap },
  { href: "/quiz", label: "Kiểm tra", icon: ClipboardList },
  { href: "/review", label: "Ôn tập từ sai", icon: BrainCircuit },
  { href: "/statistics", label: "Thống kê", icon: BarChart3 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
] as const;

export function AppSidebar({ open, close }: { open: boolean; close: () => void }) {
  const pathname = usePathname();
  return <><button type="button" aria-label="Đóng menu" className={cn("sidebar-overlay", open && "open")} onClick={close} /><aside className={cn("sidebar", open && "open")}><div className="brand"><span className="brand-mark"><BookOpen /></span><div><strong>NQT</strong><small>Vocabulary Studio</small></div><button className="sidebar-close" type="button" onClick={close} aria-label="Đóng menu"><X /></button></div><p className="nav-label">HỌC TẬP</p><nav>{items.map(({ href, label, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link onClick={close} className={cn("nav-item", active && "active")} key={href} href={href}><Icon size={19} />{label}</Link>; })}</nav><p className="nav-label admin-label">QUẢN TRỊ</p><Link onClick={close} className={cn("nav-item", pathname.startsWith("/admin") && "active")} href="/admin"><ShieldCheck size={19} />Quản trị nội dung</Link><div className="sidebar-foot"><span className="status-dot" />Lưu trữ với Supabase</div></aside></>;
}
