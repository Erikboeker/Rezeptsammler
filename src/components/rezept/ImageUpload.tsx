"use client";

// ====================================================
// ImageUpload – Komponente zum Hochladen und Zuschneiden von Bildern
// Erlaubt das Auswählen eines Bildes, das Zuschneiden auf 4:3
// und das Hochladen in den Supabase Storage.
// ====================================================

import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Upload, X, Check, Loader2, Crop } from "lucide-react";
import { toast } from "sonner";
import { getCroppedImg } from "@/lib/image-utils";
import { supabase } from "@/lib/supabase/client";

interface Props {
  /** Wird aufgerufen, wenn ein Bild erfolgreich hochgeladen wurde (gibt die URL zurück) */
  onUpload: (url: string) => void;
  /** Aktuelle Bild-URL (optional) */
  currentUrl?: string;
  /** Label für den Button */
  label?: string;
}

export function ImageUpload({ onUpload, currentUrl, label = "Bild hochladen" }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Wird aufgerufen, wenn der Zuschnitt-Bereich sich ändert */
  const onCropComplete = useCallback((_area: Area, AreaPixels: Area) => {
    setCroppedAreaPixels(AreaPixels);
  }, []);

  /** Verarbeitet die Dateiauswahl */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild ist zu groß (max. 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }

  /** Führt den Zuschnitt aus und lädt das Bild hoch */
  async function handleUpload() {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      // 1. Bild zuschneiden
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Fehler beim Zuschneiden");

      // 2. Dateiname generieren
      const dateiName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const dateiPfad = `rezepte/${dateiName}`;

      // 3. In Supabase Storage hochladen
      const { data, error } = await supabase.storage
        .from("rezept-bilder") // Stelle sicher, dass dieser Bucket existiert!
        .upload(dateiPfad, croppedBlob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // 4. Öffentliche URL abrufen
      const { data: urlData } = supabase.storage
        .from("rezept-bilder")
        .getPublicUrl(dateiPfad);

      onUpload(urlData.publicUrl);
      toast.success("Bild erfolgreich hochgeladen");
      setShowCropper(false);
      setImageSrc(null);
    } catch (error) {
      console.error("Upload-Fehler:", error);
      toast.error("Bild-Upload fehlgeschlagen. Existiert der Supabase Bucket 'rezept-bilder'?");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Vorschau oder Upload-Button */}
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <div className="relative w-32 h-24 rounded-lg overflow-hidden border bg-muted">
            <img src={currentUrl} alt="Vorschau" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs"
            >
              <Pencil className="h-3 w-3" /> Ändern
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-32 h-24 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-1" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">
              {label}
            </span>
          </button>
        )}
      </div>

      {/* Cropper Modal (vereinfacht als Overlay) */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl aspect-[4/3] bg-muted rounded-lg overflow-hidden border border-white/10">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-md">
            {/* Zoom Slider */}
            <div className="w-full space-y-2">
              <label className="text-white text-xs">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setImageSrc(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" /> Abbrechen
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isUploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Upload...</>
                ) : (
                  <><Check className="h-4 w-4" /> Zuschnitt speichern</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hilfs-Icon (falls Pencil nicht importiert ist, dachte ich mir ich add es hier lokal oder importiere es korrekt)
import { Pencil } from "lucide-react";
