"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Link2, ImageIcon, Upload, X, Check, Crop } from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { getCroppedImg } from "@/lib/image-utils";
import { ExtraktionsErgebnis, ExtractionStatus } from "@/lib/types";
import { RecipePreview } from "./RecipePreview";

export function ExtractionForm() {
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [activeTab, setActiveTab] = useState<"url" | "bild">("url");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ExtraktionsErgebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  
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
            prepareFile(file);
            break;
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  /** Schritt 1: Datei laden und Cropper anzeigen */
  function prepareFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Bild zu groß (max. 10 MB)");
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setShowCropper(true);
      setActiveTab("bild");
    };
    reader.readAsDataURL(file);
  }

  /** Schritt 2: Zuschnitt beenden und an API senden */
  async function handleCropAndAnalyze() {
    if (!imagePreview || !croppedAreaPixels) return;

    setShowCropper(false);
    setStatus("analyzing");
    setError(null);

    try {
      // Bild zuschneiden
      const croppedBlob = await getCroppedImg(imagePreview, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Fehler beim Zuschneiden");

      // Zu Base64 konvertieren für Gemini
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        try {
          const res = await fetch("/api/extrahieren", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "bild", base64, mimeType }),
          });

          if (!res.ok) {
            const data = await res.json() as { error: string };
            throw new Error(data.error ?? "Extraktion fehlgeschlagen");
          }

          const data = await res.json() as ExtraktionsErgebnis;
          setResult(data);
          setStatus("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Fehler bei der Analyse");
          setStatus("error");
        }
      };
      reader.readAsDataURL(croppedBlob);

    } catch (err) {
      setError("Zuschnitt fehlgeschlagen");
      setStatus("error");
    }
  }

  const onCropComplete = useCallback((_area: Area, AreaPixels: Area) => {
    setCroppedAreaPixels(AreaPixels);
  }, []);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    prepareFile(file);
  }

  function reset() {
    setResult(null);
    setStatus("idle");
    setError(null);
    setUrl("");
    setImagePreview(null);
    setShowCropper(false);
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
                {/* Image Preview with overlay if currently cropping */}
                {!showCropper && (
                   <div className="relative group">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                       src={imagePreview}
                       alt="Vorschau"
                       className="w-full max-h-64 object-contain rounded-lg border shadow-sm"
                     />
                     <button 
                       onClick={() => setShowCropper(true)}
                       className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 text-white rounded-lg text-xs font-medium hover:bg-black/80 transition-colors"
                     >
                       <Crop className="h-3.5 w-3.5" /> Zuschneiden
                     </button>
                   </div>
                )}

                {/* Cropper Modal-like overlay */}
                {showCropper && (
                  <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-3xl aspect-[4/3] bg-muted rounded-xl overflow-hidden shadow-2xl">
                      <Cropper
                        image={imagePreview}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9} // Hier flexibler oder 16:9 für weite Rezepte
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    
                    <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
                      <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Zoom</span>
                          <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full accent-primary h-1.5 rounded-lg appearance-none bg-white/20"
                        />
                      </div>

                      <div className="flex gap-4 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCropper(false);
                            if (!status || status === "idle") {
                              setImagePreview(null);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10"
                        >
                          <X className="h-4 w-4" /> Abbrechen
                        </button>
                        <button
                          type="button"
                          onClick={handleCropAndAnalyze}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                          <Check className="h-5 w-5" /> Analysieren
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center gap-3 py-4 text-sm font-medium text-primary animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin" />
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
                    className="w-full py-2 text-sm text-destructive hover:font-bold transition-all"
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
