"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const path = usePathname();
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="text-[#66685f] hover:bg-[#eceee6] hover:text-[#20211d] lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[300px] border-r border-[#dcddd6] bg-white p-5 text-[#20211d] shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold">PipelineOS</span>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="text-[#66685f] hover:bg-[#eceee6] hover:text-[#20211d]" aria-label="Close navigation">
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="mt-8 space-y-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = path === item.href;
              return (
                <Dialog.Close asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#777970] hover:bg-[#f4f5ef] hover:text-[#20211d]",
                      active && "bg-[#eef5df] text-[#20211d]",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Dialog.Close>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
