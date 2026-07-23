"use client";

import { useMemo, useState } from "react";
import { Mail, Pencil, Phone, Trash2, UserPlus } from "lucide-react";
import type { Company, Contact } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { repositories } from "@/lib/data/service";
import { useOwnedCollection } from "@/hooks/use-owned-collection";
import { ContactDialog, type ContactFormValues } from "./contact-dialog";
import { PAGE_SIZE } from "@/lib/constants";

export function ContactsTable({ contacts, companies }: { contacts: Contact[]; companies: Company[] }) {
  const repository = useMemo(() => repositories(createClient()).contacts, []);
  const collection = useOwnedCollection(contacts, repository);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => collection.items.filter((contact) => `${contact.first_name} ${contact.last_name} ${contact.email} ${contact.company?.name}`.toLowerCase().includes(query.toLowerCase())), [collection.items, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const save = async (values: ContactFormValues) => {
    const company = companies.find((item) => item.id === values.company_id);
    const input = { ...values, phone: values.phone || null, title: values.title || null };
    if (editing) {
      const saved = await collection.update(editing.id, input);
      Object.assign(saved, { company });
    } else {
      const saved = await collection.create(input);
      Object.assign(saved, { company });
    }
    setEditing(null);
  };
  return (
    <><div className="mt-7 flex justify-end"><Button disabled={companies.length === 0} onClick={() => { setEditing(null); setDialogOpen(true); }}><UserPlus className="size-4" /> Add contact</Button></div><Card className="mt-3 overflow-hidden">
      <ListToolbar query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search people..." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-[#e6e7e0] bg-[#fafaf7] text-[10px] font-semibold uppercase tracking-wider text-[#8b8d84]">
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Contact details</th>
              <th className="w-12 px-3 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ecece6]">
            {visible.map((contact, index) => (
              <tr key={contact.id} className="text-[12px] hover:bg-[#fafaf7]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-9 place-items-center rounded-full text-[10px] font-semibold ${index % 2 ? "bg-[#e8e3f8] text-[#605377]" : "bg-[#e9f2d8] text-[#5d7926]"}`}>{initials(`${contact.first_name} ${contact.last_name}`)}</span>
                    <div>
                      <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                      <p className="mt-1 text-[10px] text-[#92948b]">{contact.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-[#4f514a]">{contact.company?.name}</td>
                <td className="px-5 py-4 text-[#707269]">{contact.title}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    <a href={`mailto:${contact.email}`} className="rounded-md border border-[#dedfd8] p-2 text-[#777970] hover:bg-[#f0f1eb]" aria-label={`Email ${contact.first_name}`}><Mail className="size-3.5" /></a>
                    {contact.phone ? <a href={`tel:${contact.phone}`} className="rounded-md border border-[#dedfd8] p-2 text-[#777970] hover:bg-[#f0f1eb]" aria-label={`Call ${contact.first_name}`}><Phone className="size-3.5" /></a> : null}
                  </div>
                </td>
                <td className="px-3 py-4"><div className="flex justify-end"><Button variant="ghost" size="icon" aria-label={`Edit ${contact.first_name}`} onClick={() => { setEditing(contact); setDialogOpen(true); }}><Pencil className="size-3.5" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${contact.first_name}`} onClick={async () => { if (window.confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) await collection.remove(contact.id); }} className="hover:text-red-500"><Trash2 className="size-3.5" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? <div className="p-14 text-center"><p className="text-sm font-medium">No contacts found</p><p className="mt-1 text-xs text-[#85877e]">Add a stakeholder or clear your search.</p></div> : null}
      <div className="flex items-center justify-between border-t border-[#e6e7e0] px-5 py-3 text-[10px] text-[#8b8d84]"><span>{filtered.length} contacts</span><span className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>{page} / {totalPages}<Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></span></div>
    </Card>{companies.length === 0 ? <p className="mt-3 text-xs text-[#85877e]">Create a company before adding contacts.</p> : null}<ContactDialog open={dialogOpen} onOpenChange={(value) => { setDialogOpen(value); if (!value) setEditing(null); }} contact={editing} companies={companies} pending={collection.pending} onSave={save} /></>
  );
}
