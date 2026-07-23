"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Activity, Company, Contact, Deal, DealTag, Profile, Tag } from "@/lib/types";
import type { EntityPatch, OwnedRepository, WritableEntity } from "@/lib/data/service";

type Entity = Activity | Company | Contact | Deal | DealTag | Profile | Tag;

export function useOwnedCollection<T extends Entity>(
  initialItems: T[],
  repository: OwnedRepository<T>,
) {
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState(false);

  const create = useCallback(async (input: WritableEntity<T>) => {
    setPending(true);
    try {
      const saved = await repository.create(input);
      setItems((current) => [saved, ...current]);
      return saved;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create record");
      throw error;
    } finally {
      setPending(false);
    }
  }, [repository]);

  const update = useCallback(async (id: string, patch: EntityPatch<T>) => {
    let previous: T[] = [];
    setItems((current) => {
      previous = current;
      return current.map((item) => item.id === id ? { ...item, ...patch } : item);
    });
    setPending(true);
    try {
      const saved = await repository.update(id, patch);
      setItems((current) => current.map((item) => item.id === id ? saved : item));
      return saved;
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "Unable to update record");
      throw error;
    } finally {
      setPending(false);
    }
  }, [repository]);

  const remove = useCallback(async (id: string) => {
    let previous: T[] = [];
    setItems((current) => {
      previous = current;
      return current.filter((item) => item.id !== id);
    });
    setPending(true);
    try {
      await repository.delete(id);
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "Unable to delete record");
      throw error;
    } finally {
      setPending(false);
    }
  }, [repository]);

  return { items, pending, create, update, remove };
}
