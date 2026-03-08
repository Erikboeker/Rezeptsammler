"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Link2, ImageIcon, Upload } from "lucide-react";
import { ExtraktionsErgebnis, ExtractionStatus } from "@/lib/types";
import { RecipePreview } from "./RecipePreview";

export function ExtractionForm() {
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [activeTab, setActiveTab] = useState<"url" | "bild">("url");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ExtraktionsErgebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "fetching" || status === "analyzing";
  const statusText: Record<ExtractionStatus, string> = {
    fetching: "Inhalte abrufen...",
    analyzing: "KI analysiert Rezept...",
    done: "",
    error: "",
    idle: "",
  };

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setResult(null);
    setStatus("fetching");

    try {
      setStatus("analyzing");
      const res = await fetch("/api/extrahieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", url }),
      });

      if (!res.ok) {
        const data = await res.json() as { error: string };
        throw new Error(data.error ?? "Extraktion fehlgeschlagen");
      }

      const data = await res.json() as ExtraktionsErgebnis;
      setResult(data);
      setStatus("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(msg);
      toast.error(msg);
      setStatus("error");
    }
  }

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  async function processFile(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Bild zu groß (max. 4 MB)");
      return;
    }

    setActiveTab("bild");

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];

      setError(null);
      setResult(null);
      setStatus("analyzing");

      try {
        const res = await fetch("/api/extrahieren", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "bild", base64, mimeType: file.type }),
        });

        if (!res.ok) {
          const data = await res.json() as { error: string };
          throw new Error(data.error ?? "Extraktion fehlgeschlagen");
        }

        const data = await res.json() as ExtraktionsErgebnis;
        setResult(data);
        setStatus("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
        setError(msg);
        toast.error(msg);
        setStatus("error");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  function reset() {
    setResult(null);
    setStatus("idle");
    setError(null);
    setUrl("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (result) {
    return <RecipePreview initialData={result} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        {(["url", "bild"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "url" ? <Link2 className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            {tab === "url" ? "URL / Link" : "Foto / Screenshot"}
          </button>
        ))}
      </div>

      {/* URL Tab */}
      {activeTab === "url" && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rezept-URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com/rezept/pasta..."
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Unterstützt: Webseiten, YouTube, Instagram, TikTok
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {statusText[status]}
              </>
            ) : (
              "Rezept extrahieren"
            )}
          </button>
        </form>
      )}

      {/* Bild Tab */}
      {activeTab === "bild" && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            className="hidden"
          />
          {imagePreview ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Vorschau"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {statusText[status]}
                </div>
              )}
              {status === "error" && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setStatus("idle");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Anderes Bild auswählen
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full border-2 border-dashed rounded-lg p-12 text-center hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Foto hochladen</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP bis 4 MB</p>
            </button>
          )}
        </div>
      )}

      {/* Fehleranzeige */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
