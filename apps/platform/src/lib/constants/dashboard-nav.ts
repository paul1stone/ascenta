import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  Shield,
  Magnet,
  Heart,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

// ============================================================================
// NAV TYPES
// ============================================================================

export interface NavCategory {
  key: string;
  label: string;
  icon: LucideIcon;
}

// ============================================================================
// NAV DATA
// ============================================================================

export const DASHBOARD_NAV: NavCategory[] = [
  { key: "plan", label: "Plan", icon: ClipboardList },
  { key: "attract", label: "Attract", icon: Magnet },
  { key: "launch", label: "Launch", icon: Rocket },
  { key: "grow", label: "Grow", icon: TrendingUp },
  { key: "care", label: "Care", icon: Heart },
  { key: "protect", label: "Protect", icon: Shield },
];

// ============================================================================
// TAB TYPES
// ============================================================================

export type TabKey = "do" | "learn" | "status" | "dashboard";
