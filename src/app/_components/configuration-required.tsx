import { CloudOff } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ConfigurationRequired() {
  return <Card className="empty-state configuration"><span className="empty-icon"><CloudOff size={24} /></span><h2>Cần cấu hình Supabase</h2><p>Tạo <code>.env.local</code> từ <code>.env.example</code>, điền Project URL và Publishable Key rồi khởi động lại ứng dụng.</p></Card>;
}
