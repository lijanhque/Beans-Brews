"use client";

import { useState, type ChangeEvent } from "react";

export function MediaUploadField({
  name,
  label,
  initial = [],
  multiple = true,
}: {
  name: string;
  label: string;
  initial?: string[];
  multiple?: boolean;
}) {
  const [images, setImages] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setError("");

    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        const result: unknown = await response.json();
        if (
          !response.ok ||
          !result ||
          typeof result !== "object" ||
          !("url" in result) ||
          typeof result.url !== "string"
        ) {
          const message =
            result && typeof result === "object" && "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "The image could not be uploaded.";
          throw new Error(message);
        }
        uploaded.push(result.url);
      }
      setImages((current) => (multiple ? [...current, ...uploaded] : uploaded.slice(-1)));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "The image could not be uploaded.",
      );
    } finally {
      setBusy(false);
    }
  }

  const value = multiple ? JSON.stringify(images) : (images[0] ?? "");

  return (
    <div className="media-upload-field">
      <label>
        {label}
        <input
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          multiple={multiple}
          onChange={upload}
          type="file"
        />
      </label>
      <input name={name} type="hidden" value={value} />
      {busy && <span role="status">Uploading image…</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
      {images.length > 0 && (
        <div className="uploaded-media-list">
          {images.map((image) => (
            <div className="uploaded-media-item" key={image}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={image} />
              <button
                aria-label={`Remove ${image}`}
                onClick={() => setImages((current) => current.filter((url) => url !== image))}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
