import {
  BarChart3,
  Building2,
  CircleCheckBig,
  ContactRound,
  Gauge,
  Handshake,
  Settings2,
} from "lucide-react";
import type { DealStage } from "./types";

export const APP_NAME = "PipelineOS";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Contacts", href: "/contacts", icon: ContactRound },
  { label: "Deals", href: "/deals", icon: Handshake },
  { label: "Activities", href: "/activities", icon: CircleCheckBig },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings2 },
] as const;

export const DEAL_STAGES: {
  value: DealStage;
  label: string;
  probability: number;
}[] = [
  { value: "lead", label: "Lead", probability: 10 },
  { value: "qualified", label: "Qualified", probability: 30 },
  { value: "proposal", label: "Proposal", probability: 55 },
  { value: "negotiation", label: "Negotiation", probability: 75 },
  { value: "closed_won", label: "Closed won", probability: 100 },
  { value: "closed_lost", label: "Closed lost", probability: 0 },
];

export const SOURCES = [
  "Inbound",
  "Outbound",
  "Referral",
  "Partner",
  "Event",
] as const;

export const PAGE_SIZE = 10;
