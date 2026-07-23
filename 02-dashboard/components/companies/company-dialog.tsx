"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Company } from "@/lib/types";
import { FormDialog, formFieldClass } from "@/components/shared/form-dialog";

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  domain: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  size: z.string().trim().optional(),
  location: z.string().trim().optional(),
  annual_revenue: z.coerce.number().min(0).optional(),
});
export type CompanyFormValues = z.infer<typeof schema>;

export function CompanyDialog({ open, onOpenChange, company, pending, onSave }: { open: boolean; onOpenChange: (value: boolean) => void; company?: Company | null; pending: boolean; onSave: (values: CompanyFormValues) => Promise<void> }) {
  const form = useForm<z.input<typeof schema>, unknown, CompanyFormValues>({ resolver: zodResolver(schema), values: { name: company?.name ?? "", domain: company?.domain ?? "", industry: company?.industry ?? "", size: company?.size ?? "", location: company?.location ?? "", annual_revenue: company?.annual_revenue ?? 0 } });
  return <FormDialog open={open} onOpenChange={onOpenChange} title={company ? "Edit company" : "Add company"} description="Keep account context accurate for every opportunity." submitLabel={company ? "Save changes" : "Create company"} pending={pending} onSubmit={form.handleSubmit(async (values) => { await onSave(values); onOpenChange(false); })}><label className="block text-[11px] font-medium text-[#565850]">Company name<input {...form.register("name")} autoFocus className={formFieldClass} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-[11px] font-medium text-[#565850]">Domain<input {...form.register("domain")} placeholder="example.com" className={formFieldClass} /></label><label className="block text-[11px] font-medium text-[#565850]">Industry<input {...form.register("industry")} className={formFieldClass} /></label><label className="block text-[11px] font-medium text-[#565850]">Team size<input {...form.register("size")} placeholder="51–200" className={formFieldClass} /></label><label className="block text-[11px] font-medium text-[#565850]">Location<input {...form.register("location")} className={formFieldClass} /></label></div><label className="block text-[11px] font-medium text-[#565850]">Annual revenue<input {...form.register("annual_revenue")} type="number" min="0" step="1000" className={formFieldClass} /></label></FormDialog>;
}
