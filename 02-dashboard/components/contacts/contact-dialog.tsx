"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Company, Contact } from "@/lib/types";
import { FormDialog, formFieldClass } from "@/components/shared/form-dialog";

const schema = z.object({ company_id: z.string().uuid(), first_name: z.string().trim().min(1).max(80), last_name: z.string().trim().min(1).max(80), email: z.string().email(), phone: z.string().trim().optional(), title: z.string().trim().optional() });
export type ContactFormValues = z.infer<typeof schema>;

export function ContactDialog({ open, onOpenChange, contact, companies, pending, onSave }: { open: boolean; onOpenChange: (value: boolean) => void; contact?: Contact | null; companies: Company[]; pending: boolean; onSave: (values: ContactFormValues) => Promise<void> }) {
  const form = useForm<z.input<typeof schema>, unknown, ContactFormValues>({ resolver: zodResolver(schema), values: { company_id: contact?.company_id ?? companies[0]?.id ?? "", first_name: contact?.first_name ?? "", last_name: contact?.last_name ?? "", email: contact?.email ?? "", phone: contact?.phone ?? "", title: contact?.title ?? "" } });
  return <FormDialog open={open} onOpenChange={onOpenChange} title={contact ? "Edit contact" : "Add contact"} description="Connect each stakeholder to the right account." submitLabel={contact ? "Save changes" : "Create contact"} pending={pending} onSubmit={form.handleSubmit(async (values) => { await onSave(values); onOpenChange(false); })}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-[11px] font-medium text-[#565850]">First name<input {...form.register("first_name")} autoFocus className={formFieldClass} /></label><label className="block text-[11px] font-medium text-[#565850]">Last name<input {...form.register("last_name")} className={formFieldClass} /></label></div><label className="block text-[11px] font-medium text-[#565850]">Company<select {...form.register("company_id")} className={formFieldClass}>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-[11px] font-medium text-[#565850]">Email<input {...form.register("email")} type="email" className={formFieldClass} /></label><label className="block text-[11px] font-medium text-[#565850]">Phone<input {...form.register("phone")} className={formFieldClass} /></label></div><label className="block text-[11px] font-medium text-[#565850]">Role / title<input {...form.register("title")} className={formFieldClass} /></label></FormDialog>;
}
