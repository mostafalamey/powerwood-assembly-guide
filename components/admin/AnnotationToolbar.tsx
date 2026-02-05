import { useState, useEffect } from "react";
import { AnnotationCatalogItem, AnnotationInstance } from "@/types/animation";
import {
  fetchAnnotationCatalog,
  ANNOTATION_COLORS,
  DEFAULT_ANNOTATION_COLOR,
  createAnnotationInstance,
} from "@/lib/annotations";

interface AnnotationToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnnotation: (annotation: AnnotationInstance) => void;
  position?: { x: number; y: number };
}

export function AnnotationToolbar({
  isOpen,
  onClose,
  onAddAnnotation,
  position,
}: AnnotationToolbarProps) {
  const [catalog, setCatalog] = useState<AnnotationCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_ANNOTATION_COLOR);
  const [customColor, setCustomColor] = useState("");
  const [textContent, setTextContent] = useState({ en: "", ar: "" });
  const [showTextInput, setShowTextInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const items = await fetchAnnotationCatalog();
      setCatalog(items);
    } catch (error) {
      console.error("Failed to load annotation catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnotation = (item: AnnotationCatalogItem) => {
    if (item.type === "text") {
      setShowTextInput(true);
      return;
    }

    const annotation = createAnnotationInstance(
      item.id,
      item.name,
      selectedColor,
    );
    onAddAnnotation(annotation);
    onClose();
  };

  const handleAddTextAnnotation = () => {
    if (!textContent.en && !textContent.ar) {
      return;
    }

    const annotation = createAnnotationInstance("text", "Text", selectedColor, {
      en: textContent.en || "Text",
      ar: textContent.ar || "نص",
    });
    onAddAnnotation(annotation);
    setTextContent({ en: "", ar: "" });
    setShowTextInput(false);
    onClose();
  };

  const handleColorChange = (hex: string) => {
    setSelectedColor(hex);
    setCustomColor("");
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColor(hex);
    setSelectedColor(hex);
  };

  if (!isOpen) return null;

  const toolbarStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }
    : {
        position: "fixed",
        right: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1000,
      };

  return (
    <div
      style={toolbarStyle}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Add Annotation
        </h3>
        <button
          onClick={onClose}
          title="Close annotation toolbar"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Color Picker */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Color
        </label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {ANNOTATION_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => handleColorChange(color.hex)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === color.hex
                  ? "border-blue-500 scale-110"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor || selectedColor}
            onChange={handleCustomColorChange}
            className="w-8 h-8 rounded cursor-pointer"
            title="Custom color"
          />
          <input
            type="text"
            value={customColor || selectedColor}
            onChange={(e) => {
              const hex = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                setSelectedColor(hex);
                setCustomColor(hex);
              }
            }}
            placeholder="#000000"
            className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Text Content
          </label>
          <input
            type="text"
            value={textContent.en}
            onChange={(e) =>
              setTextContent({ ...textContent, en: e.target.value })
            }
            placeholder="English text"
            className="w-full px-2 py-1 text-sm border rounded mb-2 dark:bg-gray-800 dark:border-gray-600"
          />
          <input
            type="text"
            value={textContent.ar}
            onChange={(e) =>
              setTextContent({ ...textContent, ar: e.target.value })
            }
            placeholder="Arabic text (نص عربي)"
            dir="rtl"
            className="w-full px-2 py-1 text-sm border rounded mb-2 dark:bg-gray-800 dark:border-gray-600"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowTextInput(false)}
              className="flex-1 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTextAnnotation}
              className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Text
            </button>
          </div>
        </div>
      )}

      {/* Annotation Types */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Annotation Type
        </label>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {catalog.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddAnnotation(item)}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className="w-14 h-14 rounded flex items-center justify-center mb-1 overflow-hidden"
                  style={{ backgroundColor: selectedColor + "20" }}
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : item.type === "text" ? (
                    <svg
                      className="w-8 h-8"
                      style={{ color: selectedColor }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8"
                      style={{ color: selectedColor }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Click an annotation to add it to the scene. Use transform controls to
        position.
      </p>
    </div>
  );
}

export default AnnotationToolbar;
