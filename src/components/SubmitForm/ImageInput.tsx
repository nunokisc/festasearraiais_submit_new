"use client";

// =============================================================
// ImageInput.tsx
// Mutual-exclusion image input:
//   - URL of an existing image poster  (image_url)
//   - OR upload a local file           (image_up)
//
// Mirrors exactly the PHP index.php mutual-exclusion logic:
//   If image_url filled → image_up disabled (and vice versa).
//
// Validation: jpg/png/jpeg/webp, max 3 MB.
// =============================================================

import { useRef, useState } from "react";
import { FormField } from "./FormField";
import type { FormErrors } from "@/lib/types";

interface ImageInputProps {
  imageUrl: string;
  imageFile: File | null;
  errors: FormErrors;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
}

export function ImageInput({
  imageUrl,
  imageFile,
  errors,
  onUrlChange,
  onFileChange,
}: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const urlFilled = !!imageUrl.trim();
  const fileFilled = !!imageFile;

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onUrlChange(val);
    // If URL is being filled, clear file
    if (val.trim() && imageFile) {
      onFileChange(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    if (file) {
      // Clear URL field (mutual exclusion)
      onUrlChange("");
      // Preview
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  // Combined error: show image_url error unless image_up has its own
  const sharedError = errors.image_url || errors.image_up;

  return (
    <div className="space-y-3">
      {/* URL */}
      <FormField
        id="image_url"
        label="URL do cartaz (imagem)"
        error={errors.image_url}
        hint="Cola o link de uma imagem já online (jpg, png, webp)."
      >
        <input
          type="url"
          id="image_url"
          name="image_url"
          className={`field-input${errors.image_url ? " error" : ""}`}
          value={imageUrl}
          onChange={handleUrlChange}
          disabled={fileFilled}
          placeholder="https://exemplo.pt/cartaz.jpg"
          maxLength={512}
          aria-describedby={
            errors.image_url
              ? "image_url-error"
              : "image_url-hint"
          }
        />
      </FormField>

      {/* Divider */}
      <div className="flex items-center gap-3 text-sm text-[#6b7280]">
        <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
        <span>ou</span>
        <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
      </div>

      {/* File upload */}
      <FormField
        id="image_up"
        label="Upload do cartaz"
        error={errors.image_up}
        hint="JPG, PNG ou WEBP · máximo 3 MB."
      >
        <input
          ref={fileInputRef}
          type="file"
          id="image_up"
          name="image_up"
          accept=".jpg,.jpeg,.png,.webp"
          className={`field-input py-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#2d373c] file:text-white file:cursor-pointer hover:file:bg-[#3f5057] cursor-pointer${errors.image_up ? " error" : ""}`}
          onChange={handleFileChange}
          disabled={urlFilled}
          aria-describedby={
            errors.image_up
              ? "image_up-error"
              : "image_up-hint"
          }
        />
      </FormField>

      {/* Preview */}
      {(preview || (urlFilled && !errors.image_url)) && (
        <div className="mt-2">
          <p className="text-xs text-[#6b7280] mb-1">Pré-visualização:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? imageUrl}
            alt="Pré-visualização do cartaz"
            className="max-h-48 rounded-lg border border-gray-200 object-contain bg-gray-50"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Shared required error */}
      {!errors.image_url && !errors.image_up && sharedError && (
        <p className="field-error" role="alert">
          {sharedError}
        </p>
      )}
    </div>
  );
}
