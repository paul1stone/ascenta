"use client";

import { useEffect, useState } from "react";
import { ProfileEditForm } from "./profile-edit-form";

interface Props {
  employeeId: string;
}

interface Initial {
  photoBase64: string | null;
  pronouns: string;
  preferredChannel: string;
  getToKnow: {
    personalBio: string;
    hobbies: string;
    funFacts: string[];
    askMeAbout: string;
    hometown: string;
    currentlyConsuming: string;
    employeeChoice: { label: string; value: string };
  };
}

export function ProfileEditSection({ employeeId }: Props) {
  const [initial, setInitial] = useState<Initial | null>(null);

  async function load() {
    const res = await fetch(`/api/employees/${employeeId}/profile`);
    const json = await res.json();
    const p = json.profile ?? {};
    const gtk = p.getToKnow ?? {};
    setInitial({
      photoBase64: p.photoBase64 ?? null,
      pronouns: p.pronouns ?? "",
      preferredChannel: p.preferredChannel ?? "",
      getToKnow: {
        personalBio: gtk.personalBio ?? "",
        hobbies: gtk.hobbies ?? "",
        funFacts:
          Array.isArray(gtk.funFacts) && gtk.funFacts.length > 0
            ? gtk.funFacts
            : [""],
        askMeAbout: gtk.askMeAbout ?? "",
        hometown: gtk.hometown ?? "",
        currentlyConsuming: gtk.currentlyConsuming ?? "",
        employeeChoice: {
          label: gtk.employeeChoice?.label ?? "",
          value: gtk.employeeChoice?.value ?? "",
        },
      },
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  if (!initial) return <p className="text-sm text-muted-foreground">Loading...</p>;
  return (
    <ProfileEditForm
      employeeId={employeeId}
      initialProfile={initial}
      onChanged={() => {}}
    />
  );
}
