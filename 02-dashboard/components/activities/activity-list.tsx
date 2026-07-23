"use client";

import { useMemo, useState } from "react";
import { Check, Clock3, Mail, Phone, Video, ListTodo, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Activity, Contact, Deal } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { createClient } from "@/lib/supabase/client";
import { repositories } from "@/lib/data/service";
import { useOwnedCollection } from "@/hooks/use-owned-collection";
import { ActivityDialog, type ActivityFormValues } from "./activity-dialog";

const icons = { call: Phone, email: Mail, meeting: Video, task: ListTodo, note: ListTodo };

export function ActivityList({ initialActivities, deals, contacts }: { initialActivities: Activity[]; deals: Deal[]; contacts: Contact[] }) {
  const repository = useMemo(() => repositories(createClient()).activities, []);
  const collection = useOwnedCollection(initialActivities, repository);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const filtered = useMemo(() => collection.items.filter((activity) => `${activity.title} ${activity.deal?.name}`.toLowerCase().includes(query.toLowerCase())), [collection.items, query]);
  const complete = async (activity: Activity) => {
    await collection.update(activity.id, { completed_at: new Date().toISOString() });
    toast.success("Activity completed");
  };
  const save = async (values: ActivityFormValues) => {
    const input = { ...values, contact_id: values.contact_id || null, description: values.description || null, due_at: values.due_at ? new Date(values.due_at).toISOString() : null, completed_at: editing?.completed_at ?? null };
    if (editing) await collection.update(editing.id, input);
    else await collection.create(input);
    setEditing(null);
    toast.success(editing ? "Activity updated" : "Activity created");
  };
  return (
    <><div className="mt-7 flex justify-end"><Button disabled={deals.length === 0} onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="size-4" /> Add activity</Button></div><Card className="mt-3 overflow-hidden">
      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Search activities..." />
      <div className="divide-y divide-[#e9eae3]">
        {filtered.map((activity) => {
          const Icon = icons[activity.type];
          const completed = Boolean(activity.completed_at);
          return (
            <div key={activity.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafaf7] sm:px-6">
              <button onClick={() => void complete(activity)} disabled={completed || collection.pending} aria-label={`Mark ${activity.title} complete`} className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${completed ? "border-[#b8d789] bg-[#eaf4db] text-[#63862d]" : "border-[#d7d9d0] bg-white text-transparent hover:border-[#96b94f] hover:text-[#96b94f]"}`}><Check className="size-4" /></button>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0f1eb] text-[#707269]"><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[13px] font-medium ${completed ? "text-[#95978e] line-through" : ""}`}>{activity.title}</p>
                <p className="mt-1 truncate text-[10px] text-[#8a8c83]">{activity.deal?.name} · {activity.description}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="flex items-center gap-1 text-[11px] font-medium text-[#5e7242]"><Clock3 className="size-3" /> {completed ? "Completed" : "Upcoming"}</p>
                <p className="mt-1 text-[10px] text-[#96988f]">{activity.due_at ? new Date(activity.due_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No due date"}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Edit ${activity.title}`} onClick={() => { setEditing(activity); setDialogOpen(true); }}><Pencil className="size-3.5" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${activity.title}`} onClick={async () => { if (window.confirm(`Delete ${activity.title}?`)) await collection.remove(activity.id); }} className="hover:text-red-500"><Trash2 className="size-3.5" /></Button>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 ? <div className="p-14 text-center"><p className="text-sm font-medium">No activities found</p><p className="mt-1 text-xs text-[#85877e]">Schedule the next action or clear your search.</p></div> : null}
    </Card>{deals.length === 0 ? <p className="mt-3 text-xs text-[#85877e]">Create a deal before scheduling activities.</p> : null}<ActivityDialog open={dialogOpen} onOpenChange={(value) => { setDialogOpen(value); if (!value) setEditing(null); }} activity={editing} deals={deals} contacts={contacts} pending={collection.pending} onSave={save} /></>
  );
}
