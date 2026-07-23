"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    router.replace("/dashboard");
  }

  return <main className="grid min-h-screen place-items-center bg-[#10110f] px-5 text-white"><section className="w-full max-w-sm"><div className="flex items-center gap-2.5 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-lg bg-[#d8ff72] text-[#10110f]"><Sparkles className="size-4" /></span>PipelineOS</div><h1 className="mt-10 font-serif text-4xl tracking-[-0.04em]">Choose a new password.</h1><p className="mt-3 text-xs leading-5 text-[#85877e]">Use at least eight characters.</p><form onSubmit={submit} className="mt-8"><label className="block text-[11px] font-medium text-[#b6b8af]">New password<input type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-white outline-none focus:border-[#b0cc62] focus:ring-2 focus:ring-[#d8ff72]/20" /></label><Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : "Update password"}</Button></form></section></main>;
}
