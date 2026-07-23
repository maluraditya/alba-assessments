"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const formFieldClass = "mt-1.5 h-10 w-full rounded-lg border border-[#dcded5] bg-[#fafaf7] px-3 text-xs outline-none transition focus:border-[#9bb84d] focus:ring-2 focus:ring-[#d8ff72]/50";

export function FormDialog({ open, onOpenChange, title, description, submitLabel, pending, onSubmit, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  pending?: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#dedfd8] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><Dialog.Title className="font-serif text-2xl tracking-[-0.03em]">{title}</Dialog.Title><Dialog.Description className="mt-1 text-xs text-[#7f8178]">{description}</Dialog.Description></div><Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close dialog"><X className="size-4" /></Button></Dialog.Close></div><form className="mt-6 space-y-4" onSubmit={onSubmit}>{children}<div className="flex justify-end gap-2 border-t border-[#e7e8e1] pt-5"><Dialog.Close asChild><Button type="button" variant="outline">Cancel</Button></Dialog.Close><Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button></div></form></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
