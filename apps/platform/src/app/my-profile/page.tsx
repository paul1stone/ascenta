"use client";
import { useAuth } from "@/lib/auth/auth-context";
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";
import { ProfileEditSection } from "@/components/plan/profile/profile-edit-section";

export default function MyProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-display">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to edit your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          {user.name} · {user.title} · {user.department}
        </p>
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
