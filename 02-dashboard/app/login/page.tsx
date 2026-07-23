import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#10110f] text-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden border-r border-white/[0.07] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-40 top-1/3 size-[520px] rounded-full bg-[#d8ff72]/10 blur-[100px]" />
        <div className="relative flex items-center gap-2.5 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-lg bg-[#d8ff72] text-[#10110f]"><Sparkles className="size-4" /></span>PipelineOS</div>
        <div className="relative max-w-xl">
          <p className="font-serif text-[64px] leading-[0.96] tracking-[-0.04em]">Clarity for every deal in motion.</p>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#8f9189]">A focused revenue workspace for teams who want better decisions, not more CRM busywork.</p>
        </div>
        <div className="relative flex gap-8 text-[10px] uppercase tracking-[0.16em] text-[#62645d]"><span>PostgreSQL</span><span>Row-level security</span><span>Server analytics</span></div>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 lg:hidden"><span className="grid size-7 place-items-center rounded-lg bg-[#d8ff72] text-[#10110f]"><Sparkles className="size-4" /></span><span className="text-sm font-semibold">PipelineOS</span></div>
          <p className="mt-12 font-serif text-4xl tracking-[-0.04em] lg:mt-0">Welcome back.</p>
          <p className="mt-3 text-xs leading-5 text-[#85877e]">Sign in to enter your private sales workspace.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
