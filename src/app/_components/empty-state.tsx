import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <Card className="empty-state"><span className="empty-icon"><Inbox size={24} /></span><h2>{title}</h2><p>{description}</p></Card>;
}
