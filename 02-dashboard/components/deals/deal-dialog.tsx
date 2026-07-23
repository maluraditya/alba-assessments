"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import { DEAL_STAGES, SOURCES } from "@/lib/constants";
import type { Company, Deal } from "@/lib/types";
import { Button } from "@/components/ui/button";

const dealSchema = z.object({
  name: z.string().min(3, "Use at least 3 characters"),
  company_id: z.string().uuid(),
  value: z.coerce.number().positive("Value must be positive"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]),
  probability: z.coerce.number().min(0).max(100),
  source: z.string().min(1),
  expected_close_date: z.string().min(1, "Choose a close date"),
});

export type DealFormValues = z.infer<typeof dealSchema>;
type DealFormInput = z.input<typeof dealSchema>;

export function DealDialog({
  open,
  onOpenChange,
  deal,
  companies,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  companies: Company[];
  pending: boolean;
  onSubmit: (values: DealFormValues) => Promise<void>;
}) {
  const form = useForm<DealFormInput, unknown, DealFormValues>({
    resolver: zodResolver(dealSchema),
    values: {
      name: deal?.name ?? "",
      company_id: deal?.company_id ?? companies[0]?.id ?? "",
      value: deal?.value ?? 50000,
      stage: deal?.stage ?? "lead",
      probability: deal?.probability ?? 10,
      source: deal?.source ?? SOURCES[0],
      expected_close_date: deal?.expected_close_date ?? "2026-08-31",
    },
  });

  const fieldClass =
    "mt-1.5 h-10 w-full rounded-lg border border-[#dcded5] bg-[#fafaf7] px-3 text-xs outline-none transition focus:border-[#9bb84d] focus:ring-2 focus:ring-[#d8ff72]/50";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#dedfd8] bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="font-serif text-2xl tracking-[-0.03em]">{deal ? "Edit opportunity" : "Create opportunity"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[#7f8178]">Keep the signal clean. You can add contacts and tags after saving.</Dialog.Description>
            </div>
            <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close dialog"><X className="size-4" /></Button></Dialog.Close>
          </div>
          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
              onOpenChange(false);
            })}
          >
            <label className="block text-[11px] font-medium text-[#565850]">
              Opportunity name
              <input {...form.register("name")} className={fieldClass} placeholder="Northstar enterprise rollout" autoFocus />
              {form.formState.errors.name ? <span className="mt-1 block text-[10px] text-red-500">{form.formState.errors.name.message}</span> : null}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-medium text-[#565850]">
                Company
                <select {...form.register("company_id")} className={fieldClass}>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </label>
              <label className="block text-[11px] font-medium text-[#565850]">
                Deal value
                <input {...form.register("value")} type="number" min="0" step="1000" className={fieldClass} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-medium text-[#565850]">
                Stage
                <select
                  {...form.register("stage", {
                    onChange: (event) => {
                      const stage = DEAL_STAGES.find((item) => item.value === event.target.value);
                      if (stage) form.setValue("probability", stage.probability);
                    },
                  })}
                  className={fieldClass}
                >
                  {DEAL_STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
                </select>
              </label>
              <label className="block text-[11px] font-medium text-[#565850]">
                Probability
                <div className="relative">
                  <input {...form.register("probability")} type="number" min="0" max="100" className={`${fieldClass} pr-8`} />
                  <span className="absolute right-3 top-[13px] text-xs text-[#92948b]">%</span>
                </div>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-medium text-[#565850]">
                Source
                <select {...form.register("source")} className={fieldClass}>
                  {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="block text-[11px] font-medium text-[#565850]">
                Expected close
                <input {...form.register("expected_close_date")} type="date" className={fieldClass} />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#e7e8e1] pt-5">
              <Dialog.Close asChild><Button type="button" variant="outline">Cancel</Button></Dialog.Close>
              <Button type="submit" disabled={pending}>{pending ? "Saving…" : deal ? "Save changes" : "Create deal"}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
