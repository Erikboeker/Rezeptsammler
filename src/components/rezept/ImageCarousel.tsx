"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Trash2, Loader2, ImageIcon, Plus, AlertTriangle, X, Check, Crop } from "lucide-react";
import { toast } from "sonner";
import { Rezept } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";

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
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-muted/50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed shadow-sm text-muted-foreground transition-all hover:bg-muted/80">
          <ImageUpload 
            onUpload={async (url) => {
              setIsSaving(true);
              try {
                const newUrls = [url];
                await saveUrls(newUrls);
                setUrls(newUrls);
                setIndex(0);
                toast.success("Bild hinzugefügt!");
                router.refresh();
              } catch (e) {
                toast.error("Speichern fehlgeschlagen");
              } finally {
                setIsSaving(false);
              }
            }}
            label="Bild hochladen"
          />
          {!isSaving && (
            <div className="absolute bottom-6 pointer-events-none text-center">
              <p className="text-xs mt-2 opacity-60">
                Oder Bild kopieren und <kbd className="px-1 py-0.5 bg-muted border rounded text-[10px]">Strg+V</kbd> zum Einfügen
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-muted rounded-2xl shadow-lg border group overflow-hidden">
        {/* Hier nutzen wir ImageUpload als Overlay zum Ändern, falls gewünscht */}
        <div className="absolute inset-0">
          <ImageUpload 
            currentUrl={urls[index]}
            onUpload={async (neueUrl) => {
              setIsSaving(true);
              try {
                const neu = [...urls];
                neu[index] = neueUrl;
                await saveUrls(neu);
                setUrls(neu);
                toast.success("Bild aktualisiert!");
                router.refresh();
              } catch (e) {
                toast.error("Änderung fehlgeschlagen");
              } finally {
                setIsSaving(false);
              }
            }}
          />
        </div>

        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {/* Counter */}
        {urls.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 text-white text-[11px] font-medium backdrop-blur-sm select-none z-10">
            {index + 1} / {urls.length}
          </div>
        )}

        {/* Prev / Next controls (only if more than 1 image) */}
        {urls.length > 1 && !isSaving && (
          <>
            <button
              type="button"
              onClick={() => setIndex((p) => (p === 0 ? urls.length - 1 : p - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((p) => (p === urls.length - 1 ? 0 : p + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Confirmation bar OR action buttons */}
      {confirmDelete ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium flex-1">Bild {index + 1} wirklich löschen?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={executeDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
            >
              <Check className="h-4 w-4" /> Löschen
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-100 text-sm font-medium transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-medium border border-transparent hover:border-red-200 transition-all disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Bild entfernen
          </button>

          <div className="h-10 w-32 relative">
            <ImageUpload 
              onUpload={async (url) => {
                setIsSaving(true);
                try {
                  const neu = [...urls, url];
                  await saveUrls(neu);
                  setUrls(neu);
                  setIndex(neu.length - 1);
                  toast.success("Bild hinzugefügt!");
                  router.refresh();
                } catch (e) {
                  toast.error("Speichern fehlgeschlagen");
                } finally {
                  setIsSaving(false);
                }
              }}
              label="Noch ein Foto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// uploadFile und restliche JSX entfernt da nun durch ImageUpload ersetzt

