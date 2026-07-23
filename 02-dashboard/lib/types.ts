export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type ActivityType = "call" | "email" | "meeting" | "task" | "note";

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Profile extends BaseEntity {
  full_name: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
}

export interface Company extends BaseEntity {
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  annual_revenue: number | null;
}

export interface Contact extends BaseEntity {
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  company?: Pick<Company, "id" | "name">;
}

export interface Deal extends BaseEntity {
  company_id: string;
  contact_id: string | null;
  name: string;
  value: number;
  stage: DealStage;
  probability: number;
  source: string;
  expected_close_date: string | null;
  closed_at: string | null;
  lost_reason: string | null;
  company?: Pick<Company, "id" | "name">;
  contact?: Pick<Contact, "id" | "first_name" | "last_name"> | null;
  tags?: Tag[];
}

export interface Activity extends BaseEntity {
  deal_id: string;
  contact_id: string | null;
  type: ActivityType;
  title: string;
  description: string | null;
  due_at: string | null;
  completed_at: string | null;
  deal?: Pick<Deal, "id" | "name">;
}

export interface Tag extends BaseEntity {
  name: string;
  color: string;
}

export interface DealTag extends BaseEntity {
  deal_id: string;
  tag_id: string;
}

export interface DashboardMetrics {
  pipelineValue: number;
  wonRevenue: number;
  winRate: number;
  averageDealSize: number;
  openDeals: number;
  overdueActivities: number;
  pipelineDelta: number;
  revenueDelta: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  target: number;
}

export interface StageMetric {
  stage: string;
  value: number;
  deals: number;
}

export interface SourceMetric {
  source: string;
  deals: number;
  value: number;
}

export interface FunnelMetric {
  stage: string;
  deals: number;
  value: number;
}

export interface ActivityMetric {
  day: string;
  completed: number;
}

export interface AnalyticsPayload {
  metrics: DashboardMetrics;
  monthlyRevenue: MonthlyRevenue[];
  pipelineByStage: StageMetric[];
  conversionFunnel: FunnelMetric[];
  dealsBySource: SourceMetric[];
  activitiesCompleted: ActivityMetric[];
}
