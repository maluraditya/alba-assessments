"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      toast.error("Supabase is not configured. Add the project environment values.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
      if (result.error) throw result.error;
      if (mode === "login" || result.data.session) {
        toast.success(mode === "login" ? "Welcome back" : "Account created");
        router.push("/dashboard");
        router.refresh();
      } else {
        setConfirmationEmail(email);
        setPassword("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!confirmationEmail) return;
    setLoading(true);
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      toast.success("A new confirmation email has been sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resend confirmation email");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setLoading(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
      });
      if (error) throw error;
      toast.success("Password reset link sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-white outline-none placeholder:text-[#595b54] focus:border-[#b0cc62] focus:ring-2 focus:ring-[#d8ff72]/20";

  if (confirmationEmail) {
    return (
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6" role="status" aria-live="polite">
        <span className="grid size-11 place-items-center rounded-xl bg-[#d8ff72] text-[#10110f]"><MailCheck className="size-5" /></span>
        <h2 className="mt-5 text-lg font-semibold text-white">Check your inbox</h2>
        <p className="mt-2 text-xs leading-6 text-[#92958c]">We sent a confirmation link to <strong className="font-medium text-[#d7d8d2]">{confirmationEmail}</strong>. Open the email and confirm your account to continue to PipelineOS.</p>
        <p className="mt-3 text-[11px] leading-5 text-[#696b64]">The link may take a minute to arrive. Check your spam folder if you don’t see it.</p>
        <Button type="button" variant="outline" className="mt-6 w-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]" disabled={loading} onClick={resendConfirmation}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-3.5" />} Resend confirmation email</Button>
        <button type="button" onClick={() => { setConfirmationEmail(null); setEmail(""); }} className="mt-4 w-full text-center text-[11px] text-[#82847c] hover:text-white">Use a different email</button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8">
      {mode === "signup" ? <label className="mb-4 block text-[11px] font-medium text-[#b6b8af]">Full name<input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" className={fieldClass} /></label> : null}
      <label className="block text-[11px] font-medium text-[#b6b8af]">Work email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className={fieldClass} /></label>
      <label className="mt-4 block text-[11px] font-medium text-[#b6b8af]">Password<input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8+ characters" autoComplete={mode === "login" ? "current-password" : "new-password"} className={fieldClass} /></label>
      {mode === "login" ? <button type="button" disabled={loading} onClick={resetPassword} className="mt-2 text-[11px] text-[#92958c] hover:text-white">Forgot password?</button> : null}
      <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="size-4" /></>}</Button>
      <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-center text-[11px] text-[#82847c] hover:text-white">{mode === "login" ? "New to PipelineOS? Create an account" : "Already have an account? Sign in"}</button>
    </form>
  );
}
