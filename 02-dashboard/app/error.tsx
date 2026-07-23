"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-[#f4f4f0] px-5"><section className="max-w-md rounded-2xl border border-[#dedfd8] bg-white p-8 text-center shadow-sm"><span className="mx-auto grid size-11 place-items-center rounded-xl bg-red-50 text-red-600"><AlertTriangle className="size-5" /></span><h1 className="mt-5 font-serif text-3xl tracking-[-0.03em]">The workspace couldn’t load.</h1><p className="mt-3 text-xs leading-5 text-[#7f8178]">Your data was not changed. Check the connection and try again.</p><Button onClick={reset} className="mt-6">Try again</Button></section></main>;
}
