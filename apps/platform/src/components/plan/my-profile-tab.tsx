"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";
import { ProfileEditSection } from "@/components/plan/profile/profile-edit-section";
import { DownloadOrgSnapshotButton } from "@/components/plan/profile/download-org-snapshot-button";

export function MyProfileTab() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Sign in to edit your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold">My Profile</h2>
          <p className="text-sm text-muted-foreground">
            {user.name} · {user.title} · {user.department}
          </p>
        </div>
        <DownloadOrgSnapshotButton employeeId={user.id} />
      </header>

      <section className="rounded-lg border p-6">
        <FocusLayerSection employeeId={user.id} mode="edit" />
      </section>

      <section className="rounded-lg border p-6">
        <ProfileEditSection employeeId={user.id} />
      </section>
    </div>
  );
}
