import React, { useState, useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (path: string) => void;
  accept: string;
  placeholder: string;
  directory: string;
  helpText?: string;
}

export default function FileUploadField({
  label,
  value,
  onChange,
  accept,
  placeholder,
  directory,
  helpText,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.path);
      } else {
        const errorData = await response.json();
        setUploadError(errorData.message || "Upload failed");
      }
    } catch (err) {
      setUploadError("Error uploading file");
      console.error(err);
    } finally {
      setUploading(false);
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
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* File path input */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto block" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Drop file here</span> or click "Choose
          File"
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          {helpText || `Accepted: ${accept}`}
        </p>
      </div>

      {/* Upload status */}
      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Uploading file...</span>
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
              className="max-w-xs h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
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
