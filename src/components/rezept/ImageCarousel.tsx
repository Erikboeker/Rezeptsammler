"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Trash2, Loader2, ImageIcon, Plus, AlertTriangle, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Rezept } from "@/lib/types";

interface Props {
  rezept: Rezept;
}

export function ImageCarousel({ rezept }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function buildUrls(r: Rezept): string[] {
    const raw = r.bilder_urls && r.bilder_urls.length > 0
      ? r.bilder_urls
      : r.bild_url ? [r.bild_url] : [];
    return [...new Set(raw)];
  }

  const [urls, setUrls] = useState<string[]>(() => buildUrls(rezept));

  useEffect(() => {
    setUrls(buildUrls(rezept));
  }, [rezept.id]);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, Math.max(0, urls.length - 1)));
  }, [urls.length]);

  // Paste listener
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            await uploadFile(file);
            break;
          }
        }
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [urls, rezept.id]);

  async function saveUrls(newUrls: string[]) {
    const res = await fetch(`/api/rezepte/${rezept.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bilder_urls: newUrls,
        bild_url: newUrls[0] ?? null,
      }),
    });
    if (!res.ok) throw new Error("Speicherfehler");
  }

  async function uploadFile(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Bild zu groß (max. 4 MB)");
      return;
    }
    setIsSaving(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const newUrls = [...urls, dataUrl];
      await saveUrls(newUrls);
      setUrls(newUrls);
      setIndex(newUrls.length - 1);
      toast.success("Bild hinzugefügt!");
      router.refresh();
    } catch {
      toast.error("Bild konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function executeDelete() {
    setConfirmDelete(false);
    const newUrls = urls.filter((_, i) => i !== index);
    setIsSaving(true);
    try {
      await saveUrls(newUrls);
      setUrls(newUrls);
      setIndex((prev) => Math.min(prev, Math.max(0, newUrls.length - 1)));
      toast.success("Bild gelöscht!");
      router.refresh();
    } catch {
      toast.error("Löschen fehlgeschlagen.");
    } finally {
      setIsSaving(false);
    }
  }

  if (urls.length === 0) {
    return (
      <div className="space-y-3">
        <div className="relative w-full aspect-[16/9] bg-muted/50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed shadow-sm text-muted-foreground p-6 text-center">
          {isSaving ? (
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
          ) : (
            <ImageIcon className="h-10 w-10 mb-4 opacity-50" />
          )}
          <p className="font-medium">Keine Bilder vorhanden</p>
          <p className="text-sm mt-1 mb-4">
            Bild kopieren und{" "}
            <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Strg+V</kbd>{" "}
            drücken zum Einfügen
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Bild hochladen
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Image container */}
      <div className="relative w-full aspect-[16/9] bg-muted rounded-2xl shadow-lg border group" style={{ overflow: "hidden" }}>
        <img
          src={urls[index]}
          alt={`${rezept.titel} – Bild ${index + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isSaving ? "opacity-50" : "opacity-100"}`}
        />

        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {/* Counter */}
        {urls.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 text-white text-[11px] font-medium backdrop-blur-sm select-none">
            {index + 1} / {urls.length}
          </div>
        )}

        {/* Prev / Next */}
        {urls.length > 1 && !isSaving && (
          <>
            <button
              type="button"
              onClick={() => setIndex((p) => (p === 0 ? urls.length - 1 : p - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((p) => (p === urls.length - 1 ? 0 : p + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-black/20 backdrop-blur-sm">
              {urls.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation bar OR action buttons - OUTSIDE overflow:hidden */}
      {confirmDelete ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium flex-1">Bild {index + 1} wirklich löschen?</span>
          <button
            type="button"
            onClick={executeDelete}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            <Check className="h-4 w-4" /> Ja, löschen
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-100 text-sm font-medium transition-colors"
          >
            <X className="h-4 w-4" /> Abbrechen
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Bild {index + 1} löschen
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-input bg-background hover:bg-accent text-sm font-medium transition-colors disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Bild hinzufügen
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
    </div>
  );
}
