"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Calendar, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Company, Deal, DealStage } from "@/lib/types";
import { DEAL_STAGES, PAGE_SIZE } from "@/lib/constants";
import { formatCompactCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { DealDialog, type DealFormValues } from "./deal-dialog";
import { createClient } from "@/lib/supabase/client";
import { repositories } from "@/lib/data/service";
import { useOwnedCollection } from "@/hooks/use-owned-collection";

const stageStyle: Record<DealStage, string> = {
  lead: "bg-[#eeeeea] text-[#62645c]",
  qualified: "bg-[#e7eef4] text-[#4c687c]",
  proposal: "bg-[#eee9f7] text-[#695b81]",
  negotiation: "bg-[#f7eedb] text-[#8b6b2b]",
  closed_won: "bg-[#e9f4d8] text-[#5c7b26]",
  closed_lost: "bg-[#f5e5e3] text-[#945952]",
};

export function DealsWorkspace({ initialDeals, companies }: { initialDeals: Deal[]; companies: Company[] }) {
  const repository = useMemo(() => repositories(createClient()).deals, []);
  const collection = useOwnedCollection(initialDeals, repository);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<DealStage | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [page, setPage] = useState(1);
  const [valueDescending, setValueDescending] = useState(true);

  const filtered = useMemo(
    () => collection.items.filter((deal) => (stage === "all" || deal.stage === stage) && `${deal.name} ${deal.company?.name} ${deal.source}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => valueDescending ? b.value - a.value : a.value - b.value),
    [collection.items, query, stage, valueDescending],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const saveDeal = async (values: DealFormValues) => {
    const terminal = values.stage === "closed_won" || values.stage === "closed_lost";
    const input = { ...values, contact_id: editing?.contact_id ?? null, closed_at: terminal ? editing?.closed_at ?? new Date().toISOString() : null, lost_reason: editing?.lost_reason ?? null };
    if (editing) await collection.update(editing.id, input);
    else await collection.create(input);
    toast.success(editing ? "Opportunity updated" : "Opportunity created");
    setEditing(null);
  };

  const removeDeal = async (deal: Deal) => {
    if (!window.confirm(`Delete ${deal.name}? Its activities will also be deleted.`)) return;
    await collection.remove(deal.id);
    toast.success("Opportunity deleted");
  };

  return (
    <>
      <div className="mt-7 flex items-center gap-3">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1" aria-label="Filter by stage">
          <button onClick={() => { setStage("all"); setPage(1); }} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${stage === "all" ? "bg-[#20211d] text-white" : "border border-[#dcded5] bg-white text-[#73756d] hover:bg-[#f8f8f4]"}`}>All deals <span className="ml-1 opacity-60">{collection.items.length}</span></button>
          {DEAL_STAGES.slice(0, 5).map((item) => {
            const count = collection.items.filter((deal) => deal.stage === item.value).length;
            return <button key={item.value} onClick={() => { setStage(item.value); setPage(1); }} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${stage === item.value ? "bg-[#20211d] text-white" : "border border-[#dcded5] bg-white text-[#73756d] hover:bg-[#f8f8f4]"}`}>{item.label} <span className="ml-1 opacity-60">{count}</span></button>;
          })}
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="hidden sm:inline-flex"><Plus className="size-4" /> New deal</Button>
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="border-b border-[#e3e4dd]"><ListToolbar query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search opportunities..." /></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead><tr className="border-b border-[#e6e7e0] bg-[#fafaf7] text-[10px] font-semibold uppercase tracking-wider text-[#8b8d84]">
              <th className="px-5 py-3">Opportunity</th><th className="px-5 py-3">Stage</th><th className="px-5 py-3">Close date</th><th className="px-5 py-3">Source</th><th className="px-5 py-3 text-right"><button onClick={() => { setValueDescending((value) => !value); setPage(1); }} className="inline-flex items-center gap-1">Value <ArrowDownUp className="size-3" /></button></th><th className="w-24 px-3 py-3"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody className="divide-y divide-[#ecece6]">
              <AnimatePresence initial={false}>
                {visible.map((deal) => (
                  <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -12 }} key={deal.id} className="group text-[12px] hover:bg-[#fafaf7]">
                    <td className="px-5 py-4">
                      <button className="text-left" onClick={() => { setEditing(deal); setDialogOpen(true); }}>
                        <p className="font-medium text-[#24251f]">{deal.name}</p>
                        <p className="mt-1 text-[10px] text-[#92948b]">{deal.company?.name}</p>
                      </button>
                    </td>
                    <td className="px-5 py-4"><Badge className={stageStyle[deal.stage]}>{DEAL_STAGES.find((item) => item.value === deal.stage)?.label}</Badge></td>
                    <td className="px-5 py-4 text-[#66685f]"><span className="flex items-center gap-1.5"><Calendar className="size-3" />{deal.expected_close_date ? formatDate(deal.expected_close_date) : "—"}</span></td>
                    <td className="px-5 py-4 text-[#66685f]">{deal.source}</td>
                    <td className="px-5 py-4 text-right"><p className="font-semibold">{formatCompactCurrency(deal.value)}</p><p className="mt-1 text-[9px] text-[#92948b]">{deal.probability}% weighted</p></td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${deal.name}`} onClick={() => { setEditing(deal); setDialogOpen(true); }}><MoreHorizontal className="size-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${deal.name}`} onClick={() => void removeDeal(deal)} className="hover:text-red-500"><Trash2 className="size-3.5" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <div className="p-14 text-center"><p className="text-sm font-medium">No opportunities match</p><p className="mt-1 text-xs text-[#85877e]">Clear the filters or create a new deal.</p></div> : null}
        <div className="flex items-center justify-between border-t border-[#e6e7e0] px-5 py-3 text-[10px] text-[#8b8d84]"><span>{filtered.length} opportunities</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>{page} / {totalPages}</span><Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
      </Card>

      <DealDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }} deal={editing} companies={companies} pending={collection.pending} onSubmit={saveDeal} />
      <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="fixed bottom-6 right-6 z-20 shadow-lg lg:hidden"><Plus className="size-4" /> New deal</Button>
    </>
  );
}
