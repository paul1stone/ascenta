"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ascenta/ui/dialog";
import { ProfileCompletionBadge } from "./profile-completion-badge";
import { FocusLayerReadView } from "@/components/plan/focus-layer/focus-layer-read-view";

interface Props {
  employeeId: string;
  mode: "inline" | "dialog";
  trigger?: React.ReactNode;
}

interface Snapshot {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    managerName: string;
    hireDate?: string;
  };
  profile: {
    photoBase64?: string | null;
    pronouns?: string | null;
    preferredChannel?: string | null;
    getToKnow?: Record<string, unknown>;
    profileUpdatedAt?: string | null;
  };
  completion: {
    complete: number;
    total: number;
    percent: number;
    missingKeys: string[];
  };
  focusLayer: {
    status: "draft" | "submitted" | "confirmed";
    responses: Record<string, string>;
    managerConfirmed?: {
      at: string | null;
      byUserId: string | null;
      comment: string | null;
    };
  } | null;
}

function Body({ data }: { data: Snapshot }) {
  const { employee, profile, completion, focusLayer } = data;
  const initials = `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`;
  const gtk = (profile.getToKnow ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-5">
      <header className="flex items-start gap-4">
        <div className="size-16 rounded-full bg-muted grid place-items-center text-lg font-semibold overflow-hidden">
          {profile.photoBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoBase64}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-display font-bold">
                {employee.firstName} {employee.lastName}
                {profile.pronouns && (
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    · {profile.pronouns}
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {employee.jobTitle} · {employee.department}
              </p>
              <p className="text-xs text-muted-foreground">
                Reports to: {employee.managerName}
              </p>
            </div>
            <ProfileCompletionBadge
              complete={completion.complete}
              total={completion.total}
            />
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">About Me</h4>
        <Field label="Personal bio" value={(gtk.personalBio as string) ?? ""} />
        <Field
          label="Hobbies & interests"
          value={(gtk.hobbies as string) ?? ""}
        />
        <ListField
          label="Fun facts"
          items={(gtk.funFacts as string[]) ?? []}
        />
        <Field label="Ask me about" value={(gtk.askMeAbout as string) ?? ""} />
        <Field label="Hometown" value={(gtk.hometown as string) ?? ""} />
        <Field
          label="Currently reading / listening"
          value={(gtk.currentlyConsuming as string) ?? ""}
        />
        <ChoiceField
          choice={
            (gtk.employeeChoice as { label?: string; value?: string }) ?? {}
          }
        />
      </section>

      {focusLayer && focusLayer.status === "confirmed" && (
        <section>
          <FocusLayerReadView
            responses={focusLayer.responses}
            status={focusLayer.status}
            managerConfirmed={
              focusLayer.managerConfirmed
                ? {
                    at: focusLayer.managerConfirmed.at,
                    byUserId: focusLayer.managerConfirmed.byUserId,
                    comment: focusLayer.managerConfirmed.comment,
                  }
                : undefined
            }
          />
        </section>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value || !value.trim()) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-line">{value}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  const filtered = items.filter((s) => typeof s === "string" && s.trim().length > 0);
  if (!filtered.length) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ul className="list-disc pl-4 text-sm">
        {filtered.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ChoiceField({
  choice,
}: {
  choice: { label?: string; value?: string };
}) {
  if (!choice?.label?.trim() || !choice?.value?.trim()) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{choice.label}</p>
      <p className="text-sm">{choice.value}</p>
    </div>
  );
}

export function EmployeeProfileCard({ employeeId, mode, trigger }: Props) {
  const [data, setData] = useState<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [empRes, profileRes, focusRes] = await Promise.all([
        fetch(`/api/dashboard/employees/${employeeId}`),
        fetch(`/api/employees/${employeeId}/profile`),
        fetch(`/api/focus-layers/${employeeId}`),
      ]);
      const empJson = await empRes.json();
      const profileJson = await profileRes.json();
      const focusJson = await focusRes.json();
      if (cancelled) return;
      const employee = empJson.employee ?? {};
      setData({
        employee: {
          id: String(employee._id ?? employee.id ?? ""),
          firstName: employee.firstName ?? "",
          lastName: employee.lastName ?? "",
          jobTitle: employee.jobTitle ?? "",
          department: employee.department ?? "",
          managerName: employee.managerName ?? "",
          hireDate: employee.hireDate,
        },
        profile: profileJson.profile ?? {},
        completion: profileJson.completion ?? {
          complete: 0,
          total: 7,
          percent: 0,
          missingKeys: [],
        },
        focusLayer: focusJson.focusLayer ?? null,
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (!data) return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  if (mode === "inline") return <Body data={data} />;
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? <button className="underline">View profile</button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">Employee profile</DialogTitle>
        <Body data={data} />
      </DialogContent>
    </Dialog>
  );
}
