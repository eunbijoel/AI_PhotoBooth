"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { SessionRecord } from "@/types";
import { clearGallery, deleteSession, loadGallery } from "@/lib/gallery";
import { downloadPng } from "@/lib/download";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BoothBackdrop, TopBar } from "@/components/shared/chrome";
import { formatStripDate } from "@/lib/utils";
import { useBoothStore } from "@/store/booth-store";

export function GalleryExperience() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const { stripDataUrl, resetSession } = useBoothStore();

  useEffect(() => {
    setSessions(loadGallery());
  }, []);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <BoothBackdrop />
      <TopBar />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl">Gallery</h1>
            <p className="mt-2 text-white/55">브라우저에 임시 저장된 최근 세션입니다.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/setup" onClick={() => resetSession()}>
                New Session
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={sessions.length === 0}
              onClick={() => {
                clearGallery();
                setSessions([]);
                resetSession();
              }}
            >
              Clear All
            </Button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-white/55">
              아직 저장된 세션이 없습니다. 8장 중 4장을 골라 프레임을 완성해보세요.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.stripDataUrl}
                    alt="저장된 스트립"
                    className="mx-auto max-h-80 w-auto rounded-xl object-contain"
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-xs text-white/50">
                      {formatStripDate(new Date(s.createdAt))}
                      {s.caption ? ` · ${s.caption}` : ""}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => void downloadPng(s.stripDataUrl)}>
                        PNG
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="세션 삭제"
                        onClick={() => {
                          setSessions(deleteSession(s.id));
                          if (stripDataUrl === s.stripDataUrl) {
                            resetSession();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
