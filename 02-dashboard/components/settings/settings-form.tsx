"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { repositories } from "@/lib/data/service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SettingsForm({ profile }: { profile: Profile }) {
  const client = useMemo(() => createClient(), []);
  const repos = useMemo(() => repositories(client), [client]);
  const [fullName, setFullName] = useState(profile.full_name);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [pending, setPending] = useState(false);
  const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-[#dedfd8] bg-[#fafaf7] px-3 text-xs outline-none focus:ring-2 focus:ring-[#d8ff72]";

  async function save() {
    setPending(true);
    try {
      await repos.profiles.update(profile.id, { full_name: fullName, timezone });
      await client.auth.updateUser({ data: { full_name: fullName } });
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile");
    } finally {
      setPending(false);
    }
  }

  async function exportData() {
    setPending(true);
    try {
      const [companies, contacts, deals, activities, tags] = await Promise.all([
        repos.companies.list({ pageSize: 1000 }), repos.contacts.list({ pageSize: 1000 }), repos.deals.list({ pageSize: 1000 }), repos.activities.list({ pageSize: 1000 }), repos.tags.list({ pageSize: 1000 }),
      ]);
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), companies: companies.data, contacts: contacts.data, deals: deals.data, activities: activities.data, tags: tags.data }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pipelineos-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export data");
    } finally {
      setPending(false);
    }
  }

  return <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_360px]"><Card className="p-6"><h2 className="text-sm font-semibold">Profile</h2><p className="mt-1 text-[11px] text-[#85877e]">Used for ownership and activity attribution.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[11px] font-medium text-[#5c5e56]">Full name<input className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} /></label><label className="text-[11px] font-medium text-[#5c5e56]">Email<input className={inputClass} value={profile.email} type="email" readOnly aria-readonly="true" /></label><label className="text-[11px] font-medium text-[#5c5e56]">Timezone<select className={inputClass} value={timezone} onChange={(event) => setTimezone(event.target.value)}><option value="UTC">UTC</option><option value="America/Los_Angeles">Pacific Time (US)</option><option value="Asia/Kolkata">India Standard Time</option><option value="Europe/London">London</option></select></label></div><div className="mt-6 flex justify-end border-t border-[#e6e7e0] pt-5"><Button onClick={save} disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button></div></Card><div className="space-y-4"><Card className="p-5"><h2 className="text-sm font-semibold">Authentication</h2><p className="mt-1 text-[11px] leading-5 text-[#85877e]">Email confirmation and password recovery are managed by Supabase Auth.</p></Card><Card className="p-5"><h2 className="text-sm font-semibold">Data & security</h2><p className="mt-1 text-[11px] leading-5 text-[#85877e]">Your workspace is isolated with PostgreSQL Row Level Security. Exports contain only records your session can read.</p><Button variant="outline" size="sm" className="mt-4" onClick={exportData} disabled={pending}>Export my data</Button></Card></div></div>;
}
