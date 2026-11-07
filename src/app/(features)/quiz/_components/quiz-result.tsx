import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuizResult({ correct, total, timedOut, syncText, onRestart }: { correct: number; total: number; timedOut: boolean; syncText: string; onRestart: () => void }) {
  const percentage = total ? Math.round(correct / total * 100) : 0;
  return <div className="result-card card"><p className="eyebrow">KẾT QUẢ</p><div className="score-ring">{percentage}%</div><h2>{timedOut ? "Đã tự nộp khi hết giờ" : "Bạn đã hoàn thành!"}</h2><p>Đúng {correct}/{total} câu · Sai {total - correct} câu</p><p>{syncText}</p><div className="session-actions"><Button onClick={onRestart}>Làm lại</Button><Link className="button button-secondary button-md" href="/">Về trang chủ</Link><Link className="button button-ghost button-md" href="/review">Ôn từ sai</Link></div></div>;
}
