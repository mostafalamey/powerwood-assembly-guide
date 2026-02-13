import React, { useState, useReducer } from "react";
import * as THREE from "three";
import { AnnotationInstance } from "@/types/animation";
import { ANNOTATION_COLORS } from "@/lib/annotations";
import {
  ChevronRight,
  FolderOpen,
  Folder,
  PlusCircle,
  Eye,
  EyeOff,
  GitBranch,
  Type,
  ArrowRight,
  Shapes,
  X,
  MessageSquarePlus,
  Package,
  Trash2,
} from "lucide-react";

interface TreeNode {
  id: string;
  name: string;
  type: string;
  children: TreeNode[];
  object: THREE.Object3D;
  visible: boolean;
}

interface ObjectHierarchyTreeProps {
  model: THREE.Group | null;
  selectedObjects: THREE.Object3D[];
  onSelectObject: (
    object: THREE.Object3D,
    options?: { toggle?: boolean },
  ) => void;
  annotations?: AnnotationInstance[];
  annotationObjects?: Map<string, THREE.Object3D>;
  onRemoveAnnotation?: (annotationId: string) => void;
  onUpdateAnnotationColor?: (annotationId: string, color: string) => void;
}

export default function ObjectHierarchyTree({
  model,
  selectedObjects,
  onSelectObject,
  annotations = [],
  annotationObjects,
  onRemoveAnnotation,
  onUpdateAnnotationColor,
}: ObjectHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Build tree structure from Three.js scene
  const buildTree = (object: THREE.Object3D, path = ""): TreeNode => {
    const id = path || "root";
    const displayName = object.name || `${object.type} (unnamed)`;

    return {
      id,
      name: displayName,
      type: object.type,
      children: object.children.map((child, index) =>
        buildTree(child, `${id}/${child.name || index}`),
      ),
      object,
      visible: object.visible,
    };
  };

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleVisibility = (object: THREE.Object3D, e: React.MouseEvent) => {
    e.stopPropagation();
    const shouldToggleSelection =
      selectedObjects.length > 1 && selectedObjects.includes(object);
    const targets = shouldToggleSelection ? selectedObjects : [object];
    const uniqueTargets = new Set(targets);
    const nextVisible = !object.visible;

    uniqueTargets.forEach((target) => {
      target.visible = nextVisible;
      target.traverse((child) => {
        child.visible = nextVisible;
      });
    });
    // Force re-render without creating new Set
    forceUpdate();
  };

  const renderTree = (node: TreeNode, level = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedObjects.includes(node.object);
    const hasChildren = node.children.length > 0;
    const indent = level * 16;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-all duration-150 ${
            isSelected
              ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-l-2 border-blue-500"
              : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent"
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={(event) =>
            onSelectObject(node.object, { toggle: event.ctrlKey })
          }
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* Object Type Icon */}
          <div className="w-5 h-5 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
            {node.type === "Mesh" ? (
              <FolderOpen className="w-3 h-3 text-purple-500" />
            ) : node.type === "Group" ? (
              <Folder className="w-3 h-3 text-blue-500" />
            ) : (
              <PlusCircle className="w-3 h-3 text-gray-400" />
            )}
          </div>

          {/* Object Name */}
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
            {node.name}
          </span>

          {/* Type Badge */}
          <span className="text-[10px] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-md font-medium">
            {node.type}
          </span>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => toggleVisibility(node.object, e)}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-150 ${
              node.visible
                ? "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            }`}
            title={node.visible ? "Hide" : "Show"}
          >
            {node.visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <GitBranch className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          No model loaded
        </span>
      </div>
    );
  }

  const tree = buildTree(model);

  const renderAnnotationItem = (annotation: AnnotationInstance) => {
    const annotationObj = annotationObjects?.get(annotation.id);
    const isSelected = annotationObj && selectedObjects.includes(annotationObj);

    return (
      <div
        key={annotation.id}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-all duration-150 ${
          isSelected
            ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-l-2 border-purple-500"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent"
        }`}
        style={{ paddingLeft: "24px" }}
        onClick={(event) =>
          annotationObj &&
          onSelectObject(annotationObj, { toggle: event.ctrlKey })
        }
      >
        {/* Annotation Type Icon */}
        <div
          className="w-5 h-5 flex items-center justify-center rounded-md"
          style={{ backgroundColor: annotation.color + "30" }}
        >
          {annotation.type === "text" ? (
            <Type className="w-3 h-3" style={{ color: annotation.color }} />
          ) : annotation.type === "arrows" ? (
            <ArrowRight
              className="w-3 h-3"
              style={{ color: annotation.color }}
            />
          ) : (
            <Shapes className="w-3 h-3" style={{ color: annotation.color }} />
          )}
        </div>

        {/* Annotation Name */}
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
          {annotation.name || annotation.type}
        </span>

        {/* Color Picker */}
        {editingColorId === annotation.id ? (
          <div className="flex gap-1 items-center">
            {ANNOTATION_COLORS.slice(0, 5).map((color) => (
              <button
                key={color.hex}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateAnnotationColor?.(annotation.id, color.hex);
                  setEditingColorId(null);
                }}
                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingColorId(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            {/* Color indicator (click to edit) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingColorId(annotation.id);
              }}
              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: annotation.color }}
              title="Change color"
            />

            {/* Delete Button */}
            {onRemoveAnnotation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAnnotation(annotation.id);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete annotation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-500" />
          Object Hierarchy
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click to select • Toggle visibility
        </p>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {renderTree(tree)}

        {/* Annotations Section */}
        {annotations.length > 0 && (
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2">
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              onClick={() => setShowAnnotations(!showAnnotations)}
            >
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${showAnnotations ? "rotate-90" : ""}`}
              />
              <MessageSquarePlus className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Annotations
              </span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {annotations.length}
              </span>
            </div>
            {showAnnotations && (
              <div className="pb-2">
                {annotations.map(renderAnnotationItem)}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-2 border-t border-gray-200/50 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
        <Package className="w-3 h-3" />
        {tree.children.length} object(s)
        {annotations.length > 0 && ` • ${annotations.length} annotation(s)`}
      </div>
    </div>
  );
}
