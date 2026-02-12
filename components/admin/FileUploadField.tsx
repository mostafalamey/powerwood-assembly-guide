import React, { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (path: string) => void;
  accept: string;
  placeholder: string;
  directory: string;
  helpText?: string;
  maxSizeMB?: number;
}

export default function FileUploadField({
  label,
  value,
  onChange,
  accept,
  placeholder,
  directory,
  helpText,
  maxSizeMB,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Infer max size from file type if not specified
  const getMaxSize = (): number => {
    if (maxSizeMB) return maxSizeMB;
    if (accept.includes(".glb") || accept.includes(".gltf")) return 50;
    if (accept.includes("audio") || accept.includes(".mp3")) return 5;
    if (accept.includes("image")) return 2;
    return 10;
  };

  const maxSize = getMaxSize();

  const handleFileUpload = async (file: File) => {
    // Client-side file size validation
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${maxSize}MB`,
      );
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("admin_token");

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      if (value) {
        formData.append("replacePath", value);
      }

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              onChange(data.path);
              setUploadSuccess(true);
              setTimeout(() => setUploadSuccess(false), 3000);
              resolve();
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Error uploading file")),
        );

        xhr.open("POST", "/api/upload");
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (err: any) {
      setUploadError(err.message || "Error uploading file");
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* File path input */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 
            bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
            transition-all duration-200"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 rounded-xl text-sm font-medium
            bg-gradient-to-r from-blue-500 to-indigo-600 text-white
            hover:from-blue-600 hover:to-indigo-700
            shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 whitespace-nowrap"
        >
          {uploading ? "Uploading..." : "Choose File"}
        </button>
      </div>

      {/* Drag and drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner"
            : "border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto block" />
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Drop file here</span> or click
          &ldquo;Choose File&rdquo;
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          {helpText || `Accepted: ${accept}`} · Max {maxSize}MB
        </p>
      </div>

      {/* Upload status */}
      {uploading && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span>Uploading... {uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadSuccess && !uploading && (
        <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Upload complete</span>
        </div>
      )}

      {uploadError && (
        <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Preview for images */}
      {value &&
        (accept.includes("image") ||
          value.includes(".png") ||
          value.includes(".jpg")) && (
          <div className="mt-2">
            <img
              src={value}
              alt="Preview"
              className="max-w-xs h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />
    </div>
  );
}
