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
              <svg
                className={`w-3 h-3 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Object Type Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {node.type === "Mesh" ? (
              <svg
                className="w-3 h-3 text-purple-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            ) : node.type === "Group" ? (
              <svg
                className="w-3 h-3 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h12V6H4z" />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
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
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
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
