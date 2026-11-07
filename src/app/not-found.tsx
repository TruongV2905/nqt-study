import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() { return <main className="standalone"><p className="eyebrow">404</p><h1>Không tìm thấy trang</h1><p>Đường dẫn này không tồn tại trong NQT Vocabulary.</p><Link href="/"><Button>Về trang chủ</Button></Link></main>; }
