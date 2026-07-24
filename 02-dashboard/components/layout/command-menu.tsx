"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface SearchResult { id: string; type: "company" | "contact" | "deal"; title: string; subtitle: string; href: string }

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const { data, error } = await createClient().rpc("search_workspace", { search_query: query.trim() });
      if (active) {
        setResults(error ? [] : data as SearchResult[]);
        setLoading(false);
      }
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  const select = (path: string) => {
    router.push(path);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[15vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-[#dedfd8] bg-white text-[#20211d] shadow-2xl">
          <Dialog.Title className="sr-only">Search PipelineOS</Dialog.Title>
          <Command shouldFilter>
            <div className="flex items-center border-b border-[#e4e5de] px-4">
              <Search className="size-4 text-[#777970]" />
              <Command.Input
                value={query}
                onValueChange={(value) => { setQuery(value); if (value.trim().length < 2) setResults([]); }}
                placeholder="Search companies, contacts, deals..."
                className="h-14 w-full bg-transparent px-3 text-sm outline-none placeholder:text-[#92948b]"
              />
              <kbd className="rounded border border-[#dedfd8] bg-[#f5f5f1] px-1.5 py-0.5 text-[10px] text-[#777970]">ESC</kbd>
            </div>
            <Command.List className="max-h-[420px] overflow-y-auto p-2">
              <Command.Empty className="p-8 text-center text-sm text-[#85877f]">{loading ? "Searching…" : query.length < 2 ? "Type at least two characters." : "No results found."}</Command.Empty>
              <Command.Group heading="Navigate" className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#66685f]">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={`${item.label} page`}
                      onSelect={() => select(item.href)}
                      className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] capitalize text-[#5f6159] data-[selected=true]:bg-[#eef5df] data-[selected=true]:text-[#20211d]"
                    >
                      <Icon className="size-4" />
                      {item.label}
                      <ArrowRight className="ml-auto size-3.5 opacity-40" />
                    </Command.Item>
                  );
                })}
              </Command.Group>
              <Command.Group heading="Records" className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#66685f]">
                {results.map((result) => <Command.Item key={`${result.type}-${result.id}`} value={`${result.type} ${result.title} ${result.subtitle}`} onSelect={() => select(result.href)} className="mt-1 cursor-pointer rounded-lg px-3 py-2.5 text-[13px] normal-case text-[#5f6159] data-[selected=true]:bg-[#eef5df]"><span className="text-[#20211d]">{result.title}</span><span className="ml-2 text-[#85877e]">{result.type}</span></Command.Item>)}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
