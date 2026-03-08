"use client";

// ====================================================
// ImageUpload – Komponente zum Hochladen und Zuschneiden von Bildern
// Erlaubt das Auswählen eines Bildes, das Zuschneiden auf 4:3
// und das Hochladen in den Supabase Storage.
// ====================================================

import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { Upload, X, Check, Loader2, Crop, Pencil } from "lucide-react";
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

export function ImageUpload({ onUpload, currentUrl, label = "Bild hinzufügen" }: Props) {
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

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Bild ist zu groß (max. 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  }

  /** Führt den Zuschnitt aus und lädt das Bild hoch */
  async function handleUpload() {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Fehler beim Zuschneiden");

      const dateiName = `rezept_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const dateiPfad = `rezepte/${dateiName}`;

      const { error: uploadError } = await supabase.storage
        .from("rezept-bilder")
        .upload(dateiPfad, croppedBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("rezept-bilder")
        .getPublicUrl(dateiPfad);

      onUpload(publicUrl);
      setShowCropper(false);
      setImageSrc(null);
    } catch (error) {
      console.error("Upload-Fehler:", error);
      toast.error("Upload fehlgeschlagen. Bucket 'rezept-bilder' vorhanden?");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Vorschau oder Upload-Button */}
      <div className="w-full h-full min-h-[100px]">
        {currentUrl ? (
          <div className="relative w-full h-full group">
            <img src={currentUrl} alt="Vorschau" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
            >
              <Pencil className="h-5 w-5" />
              <span className="text-xs font-medium">Bild ändern</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-full min-h-[100px] border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-2" />
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary">
              {label}
            </span>
          </button>
        )}
      </div>

      {/* Cropper Modal Overlay */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl text-center mb-6">
            <h3 className="text-white text-xl font-bold">Bild zuschneiden</h3>
            <p className="text-white/60 text-sm">Wähle den optimalen Ausschnitt (4:3)</p>
          </div>

          <div className="relative w-full max-w-2xl aspect-[4/3] bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
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

          <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
            <div className="w-full space-y-3">
              <div className="flex justify-between text-xs text-white/70 font-medium">
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
                  setImageSrc(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/5"
              >
                <X className="h-4 w-4" /> Abbrechen
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                {isUploading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Upload...</>
                ) : (
                  <><Check className="h-5 w-5" /> Zuschnitt speichern</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hilfs-Icon entfernt da es jetzt oben importiert wird
