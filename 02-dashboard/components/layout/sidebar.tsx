"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, HelpCircle, LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState({ name: "Workspace user", email: "" });
  useEffect(() => {
    const client = createClient();
    void client.auth.getUser().then(({ data }) => {
      if (data.user) setAccount({ name: String(data.user.user_metadata.full_name || data.user.email?.split("@")[0] || "Workspace user"), email: data.user.email ?? "" });
    });
  }, []);
  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-white/[0.07] bg-[#10110f] text-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="grid size-7 place-items-center rounded-lg bg-[#d8ff72] text-[#10110f]">
          <Sparkles className="size-4" strokeWidth={2.5} />
        </span>
        <span className="text-sm font-semibold tracking-[-0.02em]">PipelineOS</span>
        <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#86887f]">
          Pro
        </span>
      </div>

      <nav className="flex-1 px-3 pt-5" aria-label="Primary navigation">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#60625b]">
          Workspace
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const active = path === item.href || (path === "/" && item.href === "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-[#8f9189] transition-colors hover:bg-white/[0.05] hover:text-[#f3f3ef]",
                  active &&
                    "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,.04)_inset]",
                )}
              >
                <Icon className={cn("size-[15px]", active && "text-[#d8ff72]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#60625b]">
          Manage
        </p>
        <Link
          href="/settings"
          className={cn(
            "flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-[#8f9189] hover:bg-white/[0.05] hover:text-white",
            path === "/settings" && "bg-white/[0.08] text-white",
          )}
        >
          {(() => {
            const Icon = NAV_ITEMS[6].icon;
            return <Icon className="size-[15px]" />;
          })()}
          Settings
        </Link>
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="mb-2 flex items-center gap-1">
          <button className="rounded-md p-2 text-[#777970] hover:bg-white/[0.06] hover:text-white" aria-label="Notifications">
            <Bell className="size-4" />
          </button>
          <button className="rounded-md p-2 text-[#777970] hover:bg-white/[0.06] hover:text-white" aria-label="Help">
            <HelpCircle className="size-4" />
          </button>
        </div>
        <div className="flex w-full items-center gap-3 rounded-lg p-2 text-left">
          <span className="grid size-8 place-items-center rounded-full bg-[#c8b6ff] text-xs font-semibold text-[#24201f]">
            {initials(account.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-white">{account.name}</span>
            <span className="block truncate text-[10px] text-[#6f716a]">{account.email}</span>
          </span>
          <button onClick={signOut} className="rounded-md p-2 text-[#777970] hover:bg-white/[0.06] hover:text-white" aria-label="Sign out"><LogOut className="size-3.5" /></button>
        </div>
      </div>
    </aside>
  );
}
