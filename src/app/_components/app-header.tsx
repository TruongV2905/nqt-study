"use client";

import { Cloud, CloudOff, Menu } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthSession } from "@/hooks/use-auth-session";

export function AppHeader({ openMenu }: { openMenu: () => void }) {
  const configured = isSupabaseConfigured();
  const session = useAuthSession();
  const synced = configured && session.isSuccess;
  return <header className="topbar"><button type="button" className="menu-button" onClick={openMenu} aria-label="Mở menu"><Menu /></button><div><strong>Không gian học của bạn ✦</strong><span>Học đều đặn, tiến bộ mỗi ngày</span></div><span className={synced ? "cloud-badge synced" : "cloud-badge"}>{synced ? <Cloud size={16} /> : <CloudOff size={16} />}{synced ? "Cloud Sync" : configured ? "Đang kết nối" : "Chưa cấu hình"}</span></header>;
}
