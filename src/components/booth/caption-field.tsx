"use client";

import { useBoothStore } from "@/store/booth-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function CaptionField() {
  const { caption, setCaption } = useBoothStore();
  return (
    <section>
      <Label htmlFor="caption" className="mb-2 block">
        Caption
      </Label>
      <Input
        id="caption"
        value={caption}
        maxLength={40}
        placeholder="오늘의 한 줄"
        onChange={(e) => setCaption(e.target.value)}
      />
    </section>
  );
}
