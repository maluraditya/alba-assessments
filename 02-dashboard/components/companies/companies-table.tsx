"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import type { Company } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { formatCompactCurrency, initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { repositories } from "@/lib/data/service";
import { useOwnedCollection } from "@/hooks/use-owned-collection";
import { CompanyDialog, type CompanyFormValues } from "./company-dialog";
import { PAGE_SIZE } from "@/lib/constants";

export function CompaniesTable({ companies }: { companies: Company[] }) {
  const repository = useMemo(() => repositories(createClient()).companies, []);
  const collection = useOwnedCollection(companies, repository);
  const [query, setQuery] = useState("");
  const [ascending, setAscending] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      collection.items
        .filter((company) =>
          `${company.name} ${company.industry} ${company.location}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => (ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))),
    [ascending, collection.items, query],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const save = async (values: CompanyFormValues) => {
    const input = { name: values.name, domain: values.domain || null, industry: values.industry || null, size: values.size || null, location: values.location || null, annual_revenue: values.annual_revenue ?? null };
    if (editing) await collection.update(editing.id, input);
    else await collection.create(input);
    setEditing(null);
  };
  return (
    <><div className="mt-7 flex justify-end"><Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="size-4" /> Add company</Button></div><Card className="mt-3 overflow-hidden">
      <ListToolbar query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search companies..." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e6e7e0] bg-[#fafaf7] text-[10px] font-semibold uppercase tracking-wider text-[#8b8d84]">
              <th className="px-5 py-3">
                <button onClick={() => { setAscending((value) => !value); setPage(1); }} className="flex items-center gap-1.5">
                  Company <ArrowUpDown className="size-3" />
                </button>
              </th>
              <th className="px-5 py-3">Industry</th>
              <th className="px-5 py-3">Team</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3 text-right">Revenue</th>
              <th className="w-12 px-3 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ecece6]">
            {visible.map((company, index) => (
              <tr key={company.id} className="group text-[12px] transition hover:bg-[#fafaf7]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-9 place-items-center rounded-lg text-[10px] font-semibold ${["bg-[#ecf4d8] text-[#56701f]", "bg-[#e8e3f8] text-[#605377]", "bg-[#f7e8da] text-[#8b5b35]"][index % 3]}`}>
                      {initials(company.name)}
                    </span>
                    <div>
                      <p className="font-medium text-[#24251f]">{company.name}</p>
                      <p className="mt-1 text-[10px] text-[#92948b]">{company.domain}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><Badge>{company.industry}</Badge></td>
                <td className="px-5 py-4 text-[#5f6159]">{company.size}</td>
                <td className="px-5 py-4 text-[#5f6159]">{company.location}</td>
                <td className="px-5 py-4 text-right font-medium">{formatCompactCurrency(company.annual_revenue ?? 0)}</td>
                <td className="px-3 py-4"><div className="flex justify-end opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${company.name}`} onClick={() => { setEditing(company); setDialogOpen(true); }}><Pencil className="size-3.5" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${company.name}`} onClick={async () => { if (window.confirm(`Delete ${company.name}? Related contacts will also be deleted.`)) { await collection.remove(company.id); } }} className="hover:text-red-500"><Trash2 className="size-3.5" /></Button></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? <div className="p-14 text-center"><p className="text-sm font-medium">No companies found</p><p className="mt-1 text-xs text-[#85877e]">Create the first account or clear your search.</p></div> : null}
      <div className="flex items-center justify-between border-t border-[#e6e7e0] px-5 py-3 text-[10px] text-[#8b8d84]">
        <span>{filtered.length} companies</span>
        <span className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>{page} / {totalPages}<Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></span>
      </div>
    </Card><CompanyDialog open={dialogOpen} onOpenChange={(value) => { setDialogOpen(value); if (!value) setEditing(null); }} company={editing} pending={collection.pending} onSave={save} /></>
  );
}
