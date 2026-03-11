"use client";

// ====================================================
// ImageUpload – Wrapper um FotoZuschneidenModal
// Ersetzt die alte react-easy-crop-Implementierung.
// Wird im RezeptFormular für das Hauptbild genutzt.
// ====================================================

import { useState, useRef } from "react";
import { Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import { FotoZuschneidenModal } from "./FotoZuschneidenModal";

interface Props {
  /** Wird aufgerufen, wenn ein Bild zugeschnitten wurde (gibt DataURL zurück) */
  onUpload: (url: string) => void;
  /** Aktuelle Bild-URL (optional) */
  currentUrl?: string;
  /** Label für den Button */
  label?: string;
}

export function ImageUpload({ onUpload, currentUrl, label = "Bild hinzufügen" }: Props) {
  // Zustand für das Bild, das gerade zugeschnitten wird
  const [bildZumZuschneiden, setBildZumZuschneiden] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Verarbeitet die Dateiauswahl und öffnet das Zuschneiden-Modal */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Bild ist zu groß (max. 10 MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setBildZumZuschneiden(reader.result as string);
    reader.readAsDataURL(file);
    // Input zurücksetzen, damit dieselbe Datei nochmals gewählt werden kann
    e.target.value = "";
  }

  return (
    <div className="w-full h-full">
      {/* Zuschneiden-Modal */}
      {bildZumZuschneiden && (
        <FotoZuschneidenModal
          bildUrl={bildZumZuschneiden}
          onAbbruch={() => setBildZumZuschneiden(null)}
          onSpeichern={(neueBildUrl) => {
            setBildZumZuschneiden(null);
            onUpload(neueBildUrl);
          }}
        />
      )}

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
    </div>
  );
}
