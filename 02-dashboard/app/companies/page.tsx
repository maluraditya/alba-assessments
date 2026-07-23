import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CompaniesTable } from "@/components/companies/companies-table";
import { loadCompanies } from "@/lib/data/loaders";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const companies = await loadCompanies();
  return (
    <AppShell><div className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader eyebrow="Accounts" title="Companies" description="The organizations in your market, enriched with the context your team needs." />
      <CompaniesTable companies={companies} />
    </div></AppShell>
  );
}
