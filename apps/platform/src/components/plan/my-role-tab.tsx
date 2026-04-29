"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";
import { FocusLayerReadView } from "@/components/plan/focus-layer/focus-layer-read-view";
import { FocusLayerStatusPill } from "@/components/plan/focus-layer/focus-layer-status-pill";
import { ProfileEditSection } from "@/components/plan/profile/profile-edit-section";
import { DownloadOrgSnapshotButton } from "@/components/plan/profile/download-org-snapshot-button";
import { GET_TO_KNOW_FIELDS } from "@ascenta/db/employee-profile-constants";

interface ProfileSnapshot {
  photoBase64?: string | null;
  pronouns?: string | null;
  preferredChannel?: string | null;
  getToKnow?: Record<string, unknown>;
}

interface FocusLayerSnapshot {
  responses: Record<string, string>;
  status: "draft" | "submitted" | "confirmed";
  jobDescriptionAssigned: boolean;
}

const PLAN_ACCENT = "#6688bb";
const COMPASS_ORANGE = "#ff6b35";

export function MyRoleTab() {
  const { user, loading } = useAuth();
  const [editAboutMe, setEditAboutMe] = useState(false);
  const [editFocusLayer, setEditFocusLayer] = useState(false);
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [fl, setFl] = useState<FocusLayerSnapshot | null>(null);

  async function load(employeeId: string) {
    const [profileRes, flRes, empRes] = await Promise.all([
      fetch(`/api/employees/${employeeId}/profile`),
      fetch(`/api/focus-layers/${employeeId}`),
      fetch(`/api/dashboard/employees/${employeeId}`).catch(() => null),
    ]);
    const profileJson = await profileRes.json();
    const flJson = await flRes.json();
    const empJson = empRes ? await empRes.json().catch(() => ({})) : {};
    setProfile(profileJson.profile ?? {});
    setFl({
      responses: flJson.focusLayer?.responses ?? {
        uniqueContribution: "",
        highImpactArea: "",
        signatureResponsibility: "",
        workingStyle: "",
      },
      status: flJson.focusLayer?.status ?? "draft",
      jobDescriptionAssigned: !!empJson?.employee?.jobDescriptionId,
    });
  }

  useEffect(() => {
    if (user?.id) load(user.id);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading your role...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Sign in to edit your role.
        </p>
      </div>
    );
  }

  const compassHref = `/do?prompt=${encodeURIComponent("Help me build my role")}&tool=startMyRoleWorkflow`;
  const suggestHref = `/do?prompt=${encodeURIComponent("Suggest my Focus Layer from my JD")}&tool=suggestFromJD`;
  const aboutMeHasContent =
    !!profile &&
    [
      profile.pronouns,
      profile.preferredChannel,
      ...Object.values((profile.getToKnow ?? {}) as Record<string, unknown>),
    ].some(
      (v) =>
        (typeof v === "string" && v.trim().length > 0) ||
        (Array.isArray(v) && v.some((s) => typeof s === "string" && s.trim())),
    );
  const flHasContent =
    !!fl && Object.values(fl.responses).some((v) => v && v.trim().length > 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold">My Role</h2>
          <p className="text-sm text-muted-foreground">
            {user.name} · {user.title} · {user.department}
          </p>
        </div>
        <DownloadOrgSnapshotButton employeeId={user.id} />
      </header>

      {/* Compass cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={compassHref}
          className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
          style={{
            borderColor: "rgba(255, 107, 53, 0.3)",
            background: "rgba(255, 107, 53, 0.03)",
          }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
          >
            <Compass className="size-[18px]" style={{ color: COMPASS_ORANGE }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-deep-blue">
              Build my Role with Compass
            </p>
            <p className="text-xs text-muted-foreground truncate">
              AI-guided interview to shape your role
            </p>
          </div>
        </Link>

        {fl?.jobDescriptionAssigned ? (
          <Link
            href={suggestHref}
            className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
            style={{
              borderColor: `${PLAN_ACCENT}4d`,
              background: `${PLAN_ACCENT}08`,
            }}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${PLAN_ACCENT}1a` }}
            >
              <Sparkles className="size-[18px]" style={{ color: PLAN_ACCENT }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Suggest from my JD
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Draft your Focus Layer from your assigned JD
              </p>
            </div>
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 rounded-xl border p-4 opacity-60 cursor-not-allowed"
            title="No job description is assigned to you yet"
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${PLAN_ACCENT}1a` }}
            >
              <Sparkles className="size-[18px]" style={{ color: PLAN_ACCENT }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Suggest from my JD
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Available once a JD is assigned to you
              </p>
            </div>
          </div>
        )}
      </div>

      {/* About Me */}
      <section className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">About Me</h3>
          <button
            onClick={() => setEditAboutMe((v) => !v)}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" />
            {editAboutMe ? "Done" : "Edit"}
          </button>
        </div>

        {editAboutMe ? (
          <ProfileEditSection employeeId={user.id} />
        ) : aboutMeHasContent ? (
          <AboutMeReadView profile={profile ?? {}} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No About Me yet — start with Compass or click Edit.
          </p>
        )}
      </section>

      {/* Focus Layer */}
      <section className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold">Focus Layer</h3>
            {fl && <FocusLayerStatusPill status={fl.status} />}
          </div>
          <button
            onClick={() => setEditFocusLayer((v) => !v)}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" />
            {editFocusLayer ? "Done" : "Edit"}
          </button>
        </div>

        {editFocusLayer ? (
          <FocusLayerSection employeeId={user.id} mode="edit" />
        ) : flHasContent && fl ? (
          <FocusLayerReadView responses={fl.responses} status={fl.status} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No Focus Layer yet — start with Compass or click Edit.
          </p>
        )}
      </section>
    </div>
  );
}

function AboutMeReadView({ profile }: { profile: ProfileSnapshot }) {
  const gtk = (profile.getToKnow ?? {}) as Record<string, unknown>;
  const funFacts = Array.isArray(gtk.funFacts)
    ? (gtk.funFacts as string[]).filter((s) => s && s.trim().length > 0)
    : [];
  const choice = gtk.employeeChoice as
    | { label?: string; value?: string }
    | undefined;
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {profile.pronouns && (
          <Row label="Pronouns" value={profile.pronouns} />
        )}
        {profile.preferredChannel && (
          <Row label="Preferred contact" value={profile.preferredChannel} />
        )}
        {GET_TO_KNOW_FIELDS.map((f) => {
          const v = gtk[f.key];
          if (typeof v !== "string" || !v.trim()) return null;
          return (
            <Row
              key={f.key}
              label={f.label}
              value={v}
              full={!!f.multiline}
            />
          );
        })}
      </div>
      {funFacts.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Fun facts
          </p>
          <ul className="list-disc pl-5 text-sm space-y-0.5">
            {funFacts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {choice?.label && choice?.value && (
        <Row label={choice.label} value={choice.value} full />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}
