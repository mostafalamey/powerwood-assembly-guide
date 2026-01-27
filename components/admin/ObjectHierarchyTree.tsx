import React, { useState, useReducer } from "react";
import * as THREE from "three";

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
  selectedObject: THREE.Object3D | null;
  onSelectObject: (object: THREE.Object3D) => void;
}

export default function ObjectHierarchyTree({
  model,
  selectedObject,
  onSelectObject,
}: ObjectHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
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
    object.visible = !object.visible;
    object.traverse((child) => {
      child.visible = object.visible;
    });
    // Force re-render without creating new Set
    forceUpdate();
  };

  const renderTree = (node: TreeNode, level = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedObject === node.object;
    const hasChildren = node.children.length > 0;
    const indent = level * 16;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isSelected ? "bg-blue-100 dark:bg-blue-900/30" : ""
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => onSelectObject(node.object)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <span
                className={`material-symbols-rounded text-sm transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              >
                chevron_right
              </span>
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Object Type Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {node.type === "Mesh" ? (
              <span className="material-symbols-rounded text-sm text-purple-500">
                category
              </span>
            ) : node.type === "Group" ? (
              <span className="material-symbols-rounded text-sm text-blue-500">
                folder
              </span>
            ) : (
              <span className="material-symbols-rounded text-sm text-gray-500">
                add_circle
              </span>
            )}
          </div>

          {/* Object Name */}
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
            {node.name}
          </span>

          {/* Type Badge */}
          <span className="text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
            {node.type}
          </span>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => toggleVisibility(node.object, e)}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title={node.visible ? "Hide" : "Show"}
          >
            {node.visible ? (
              <span className="material-symbols-rounded text-base">
                visibility
              </span>
            ) : (
              <span className="material-symbols-rounded text-base">
                visibility_off
              </span>
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
      <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-400">
        No model loaded
      </div>
    );
  }

  const tree = buildTree(model);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Object Hierarchy
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click to select • Toggle visibility
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">{renderTree(tree)}</div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {tree.children.length} object(s)
      </div>
    </div>
  );
}
