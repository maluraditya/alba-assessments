import type { SupabaseClient } from "@supabase/supabase-js";
import type { Activity, Company, Contact, Deal, DealTag, Profile, Tag } from "@/lib/types";

export const TABLES = {
  profiles: "profiles",
  companies: "companies",
  contacts: "contacts",
  deals: "deals",
  activities: "activities",
  tags: "tags",
  dealTags: "deal_tags",
} as const;

type OwnedEntity = Company | Contact | Deal | DealTag | Activity | Tag | Profile;
type RelationKey = "company" | "contact" | "deal" | "tags";
export type WritableEntity<T extends OwnedEntity> = Omit<T, "id" | "created_at" | "updated_at" | "owner_id" | RelationKey>;
export type EntityPatch<T extends OwnedEntity> = Partial<WritableEntity<T>>;

async function authenticatedUser(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Authentication required");
  return data.user;
}

export class OwnedRepository<T extends OwnedEntity> {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string,
    private readonly select = "*",
  ) {}

  async list({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) {
    await authenticatedUser(this.client);
    const from = (page - 1) * pageSize;
    const { data, error, count } = await this.client
      .from(this.table)
      .select(this.select, { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    return { data: (data ?? []) as unknown as T[], count: count ?? 0 };
  }

  async get(id: string) {
    await authenticatedUser(this.client);
    const { data, error } = await this.client
      .from(this.table)
      .select(this.select)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as T;
  }

  async create(input: WritableEntity<T>) {
    const user = await authenticatedUser(this.client);
    const { data, error } = await this.client
      .from(this.table)
      .insert({ ...input, owner_id: user.id })
      .select(this.select)
      .single();
    if (error) throw error;
    return data as unknown as T;
  }

  async update(id: string, patch: EntityPatch<T>) {
    await authenticatedUser(this.client);
    const { data, error } = await this.client
      .from(this.table)
      .update(patch as never)
      .eq("id", id)
      .select(this.select)
      .single();
    if (error) throw error;
    return data as unknown as T;
  }

  async delete(id: string) {
    await authenticatedUser(this.client);
    const { error } = await this.client.from(this.table).delete().eq("id", id);
    if (error) throw error;
  }
}

export function repositories(client: SupabaseClient) {
  return {
    companies: new OwnedRepository<Company>(client, TABLES.companies),
    contacts: new OwnedRepository<Contact>(
      client,
      TABLES.contacts,
      "*, company:companies(id,name)",
    ),
    deals: new OwnedRepository<Deal>(
      client,
      TABLES.deals,
      "*, company:companies(id,name), contact:contacts(id,first_name,last_name), deal_tags(tag:tags(*))",
    ),
    activities: new OwnedRepository<Activity>(
      client,
      TABLES.activities,
      "*, deal:deals(id,name)",
    ),
    tags: new OwnedRepository<Tag>(client, TABLES.tags),
    dealTags: new OwnedRepository<DealTag>(client, TABLES.dealTags),
    profiles: new OwnedRepository<Profile>(client, TABLES.profiles),
  };
}
