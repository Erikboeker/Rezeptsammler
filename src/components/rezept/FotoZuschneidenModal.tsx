"use client";

/**
 * ====================================================
 * FotoZuschneidenModal – Komponente zum Zuschneiden von Bildern
 * NUTZT JETZT react-image-crop für klassische Ziehpunkte (Handles).
 * ====================================================
 */

import { useState, useRef, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop, type Crop as ReactCropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, Crop as CropIcon } from "lucide-react";
import { holeZugschnittenesBild } from "@/lib/image-utils";

interface Props {
  bildUrl: string;
  onAbbruch: () => void;
  onSpeichern: (neueBildUrl: string) => void;
  aspekt?: number;
}

export function FotoZuschneidenModal({ bildUrl, onAbbruch, onSpeichern, aspekt }: Props) {
  const [crop, setCrop] = useState<ReactCropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Initialen Ausschnitt setzen, wenn das Bild geladen wird
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    
    // Initialer Ausschnitt: 80% der Fläche, zentriert
    const initialCrop = aspekt 
      ? centerCrop(makeAspectCrop({ unit: "%", width: 80 }, aspekt, width, height), width, height)
      : centerCrop({ unit: "%", width: 80, height: 80, x: 10, y: 10 }, width, height);
      
    setCrop(initialCrop);
  }

  const handleSpeichern = async () => {
    try {
      if (!completedCrop || !imgRef.current) return;
      
      // Wir müssen die Pixel-Werte korrekt berechnen, falls die Anzeige skaliert ist
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const zugschnitten = await holeZugschnittenesBild(bildUrl, pixelCrop);
      onSpeichern(zugschnitten);
    } catch (fehler) {
      console.error("Fehler beim Zuschneiden:", fehler);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-8">
      <div className="bg-background w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <CropIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight">Ausschnitt wählen</h3>
              <p className="text-xs text-muted-foreground">Ziehe an den Ecken, um das Bild anzupassen</p>
            </div>
          </div>
          <button 
            onClick={onAbbruch}
            className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Editor Bereich */}
        <div className="relative flex-1 bg-[#0f0f0f] overflow-auto flex items-center justify-center p-4 min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspekt}
            className="max-w-full max-h-full"
          >
            <img
              ref={imgRef}
              src={bildUrl}
              alt="Zuschneiden"
              onLoad={onImageLoad}
              className="max-w-full max-h-[60vh] object-contain shadow-2xl"
              style={{ userSelect: 'none' }}
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-card flex flex-col sm:flex-row gap-3 justify-end items-center">
            <p className="text-xs text-muted-foreground sm:mr-auto text-center sm:text-left">
              Tipp: Du kannst den Rahmen an den Ecken und Kanten ziehen oder in der Mitte verschieben.
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onAbbruch}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 font-semibold hover:bg-muted transition-all active:scale-95"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSpeichern}
                disabled={!completedCrop?.width || !completedCrop?.height}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <Check className="h-5 w-5" />
                Speichern
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
