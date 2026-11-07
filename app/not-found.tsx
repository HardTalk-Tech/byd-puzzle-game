import Link from "next/link";
import { messages } from "@/content/messages";

export default function NotFound() {
  return (
    <div className="kiosk-viewport">
      <div className="kiosk-root flex flex-col items-center justify-center gap-[3cqh] px-[8cqw] text-center">
        <h1 className="font-display gold-text text-k-2xl font-black">{messages.notFound.title}</h1>
        <p className="text-k-sm text-ivory/80">{messages.notFound.body}</p>
        <Link href="/" className="gold-button font-display flex min-h-[max(56px,8.9cqw)] items-center px-[8cqw] text-k-sm font-bold">
          {messages.notFound.back}
        </Link>
      </div>
    </div>
  );
}
