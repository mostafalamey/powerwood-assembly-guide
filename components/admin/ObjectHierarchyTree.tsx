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
          className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-all duration-150 ${
            isSelected
              ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-l-2 border-blue-500"
              : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent"
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
              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <span
                className={`material-symbols-rounded text-sm transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              >
                chevron_right
              </span>
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* Object Type Icon */}
          <div className="w-5 h-5 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
            {node.type === "Mesh" ? (
              <span className="material-symbols-rounded text-xs text-purple-500">
                category
              </span>
            ) : node.type === "Group" ? (
              <span className="material-symbols-rounded text-xs text-blue-500">
                folder
              </span>
            ) : (
              <span className="material-symbols-rounded text-xs text-gray-400">
                add_circle
              </span>
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
              <span className="material-symbols-rounded text-sm">
                visibility
              </span>
            ) : (
              <span className="material-symbols-rounded text-sm">
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
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <span className="material-symbols-rounded text-4xl text-gray-300 dark:text-gray-600 mb-2">
          account_tree
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          No model loaded
        </span>
      </div>
    );
  }

  const tree = buildTree(model);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-rounded text-indigo-500">
            account_tree
          </span>
          Object Hierarchy
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click to select • Toggle visibility
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">{renderTree(tree)}</div>
      <div className="p-2 border-t border-gray-200/50 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <span className="material-symbols-rounded text-xs">inventory_2</span>
        {tree.children.length} object(s)
      </div>
    </div>
  );
}
