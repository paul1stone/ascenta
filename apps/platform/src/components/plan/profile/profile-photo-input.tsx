"use client";

import { useRef, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { PHOTO_MAX_BASE64_BYTES } from "@ascenta/db/employee-profile-constants";
import { Camera, X } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (next: string | null) => void;
}

export function ProfilePhotoInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      const img = await loadImage(dataUrl);
      const compressed = compressToJpeg(img, 256, 0.85);
      if (compressed.length > PHOTO_MAX_BASE64_BYTES) {
        setError("Photo too large after compression — try a smaller source image.");
        return;
      }
      onChange(compressed);
    } catch {
      setError("Could not read image. Try a different file.");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="size-20 rounded-full overflow-hidden bg-muted/40 grid place-items-center">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Profile" className="size-full object-cover" />
        ) : (
          <Camera className="size-6 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            // reset so the same file can be selected again
            e.target.value = "";
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Replace" : "Add photo"}
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(null)}
            >
              <X className="size-4" /> Remove
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
}

function compressToJpeg(
  img: HTMLImageElement,
  max: number,
  quality: number
): string {
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}
