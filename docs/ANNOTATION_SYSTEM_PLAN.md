# Annotation System Implementation Plan

**Created:** February 5, 2026  
**Status:** ✅ Implemented

## Overview

Add a GLB-based annotation system to the authoring tool that allows users to add arrows, callouts, text, and other graphical elements to assembly animations. Annotations are treated as first-class scene objects with full animation support.

### Key Decisions

- **Scope:** Per-step annotations (not shared across steps)
- **Color Control:** Material color override via mesh material properties
- **UI:** Floating toolbar for annotation selection
- **Feature Set:** GLB shapes + 3D text annotations

---

## Implementation Summary

### Files Created

| File                                     | Purpose                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `types/animation.ts`                     | `AnnotationInstance`, `AnnotationCatalogItem` interfaces           |
| `lib/annotations.ts`                     | GLB loader, color utilities, text sprite creation, catalog fetcher |
| `components/admin/AnnotationToolbar.tsx` | Floating toolbar with color picker and type grid                   |
| `pages/api/annotations.ts`               | API to list available annotation GLBs with thumbnails              |

### Files Modified

| File                                            | Changes                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `components/admin/AuthoringSceneViewer.tsx`     | forwardRef, `addAnnotation`, `removeAnnotation`, `updateAnnotationColor` methods |
| `components/admin/ObjectHierarchyTree.tsx`      | Annotations section with color picker and delete buttons                         |
| `pages/admin/cabinets/[id]/steps/authoring.tsx` | Annotation state, handlers, save/load integration                                |
| `components/3d/SceneViewer.tsx`                 | `loadAnnotations()`, `applyKeyframesAtTime()`, initial state fix                 |

---

## Implementation Steps

### 1. Define Annotation Types ✅

**File:** `types/animation.ts`

Add `AnnotationInstance` interface:

- `id`: Unique identifier (UUID)
- `type`: GLB filename or "text"
- `color`: Hex color string
- `text?`: `{ en: string; ar: string }` for text annotations

Add `annotationInstances: AnnotationInstance[]` to `StepAnimation` interface.

Reuse existing `ObjectKeyframe` for annotation transforms using `annotation-{id}` as objectId.

---

### 2. Create Annotation Catalog Loader ✅

**File:** `lib/annotations.ts`

- Function to fetch available annotation GLBs from `/models/annotations/`
- Cache loaded GLB geometries for reuse
- Export annotation metadata (filename, display name)

---

### 3. Create Floating Annotation Toolbar ✅

**File:** `components/admin/AnnotationToolbar.tsx`

- Grid of annotation type thumbnails
- "Add Text" button for 3D text creation
- Color picker (predefined swatches + custom hex input)
- Click-to-add interaction

---

### 4. Update AuthoringSceneViewer ✅

**File:** `components/admin/AuthoringSceneViewer.tsx`

- Add `annotationInstances` prop
- Load annotation GLBs dynamically using `GLTFLoader`
- For text: use canvas-based sprite (billboard text)
- Register in `objectLookupRef` using `annotation-{id}` pattern
- Apply color override to mesh materials

---

### 5. Update Authoring Page State ✅

**File:** `pages/admin/cabinets/[id]/steps/authoring.tsx`

- Add state: `annotationInstances`, `selectedAnnotationId`
- Add functions: `addAnnotation()`, `removeAnnotation()`, `updateAnnotationColor()`
- Include annotations in undo/redo history
- Update save payload to include `annotationInstances`

---

### 6. Integrate with Timeline ✅

**File:** `components/admin/Timeline.tsx`

- Show annotation objects in existing object track
- Color-code annotation keyframe diamonds for distinction

---

### 7. Add to Object Hierarchy ✅

**File:** `components/admin/ObjectHierarchyTree.tsx`

- Add collapsible "Annotations" section below model hierarchy
- Show instances with type icon, name, delete button
- Click to select (same behavior as model objects)

---

### 8. Create Annotations API Endpoint ✅

**File:** `pages/api/annotations.ts`

- List available GLB files from `/public/models/annotations/`
- Return metadata: filename, display name, thumbnail path

---

### 9. Update Playback SceneViewer ✅

**File:** `components/3d/SceneViewer.tsx`

- Load annotation instances from step animation data
- Apply keyframe animations during playback
- Match color override logic from authoring viewer
- Fixed initial frame rendering (objects/annotations now show correctly at time=0)

---

### 10. Add Sample Annotation GLBs ✅

**Location:** `public/models/annotations/`

Available annotations:

- `anno_arrow_move_single.glb` - Single directional arrow
- `anno_arrow_move_double.glb` - Double-headed arrow
- `anno_arrow_rotate_cw.glb` - Clockwise rotation indicator
- `anno_arrow_rotate_ccw.glb` - Counter-clockwise rotation indicator
- `anno_arrow_rotate_double.glb` - Bi-directional rotation indicator

Each GLB has a matching `.png` thumbnail for the toolbar.

---

## Usage Guide

### Adding Annotations in Authoring Tool

1. Open the authoring tool for any step
2. Click the **Annotate** button in the toolbar
3. Select a color from the swatches or enter a custom hex value
4. Click an annotation type to add it to the scene
5. Use transform controls to position the annotation
6. Add keyframes on the timeline to animate

### Annotation Data Structure

Annotations are saved in the step's animation data:

```json
{
  "duration": 5,
  "isOffset": true,
  "objectKeyframes": [...],
  "cameraKeyframes": [...],
  "annotationInstances": [
    {
      "id": "annotation-1738777200000-abc123",
      "type": "anno_arrow_move_single",
      "color": "#ef4444",
      "name": "Arrow"
    }
  ]
}
```

### Adding Custom Annotations

1. Create a GLB file with a single mesh
2. Use neutral colors (will be overridden by color picker)
3. Place in `/public/models/annotations/`
4. Optionally add a matching `.png` thumbnail
5. The annotation will automatically appear in the toolbar

---

## Verification Checklist

- [x] Add arrow annotation to BC-002 Step 1, set color to red, animate position
- [x] Save animation, reload page, verify persistence with correct color
- [x] Open assembly viewer (`/cabinet/BC-002`), verify annotation appears and animates
- [x] Test 3D text annotation with English and Arabic text
- [x] Verify thumbnails display in annotation toolbar
- [x] Verify initial state (time=0) renders correctly on page load
- [ ] Test undo/redo includes annotation changes

---

## Technical Notes

### Annotation Naming Convention

Use `annotation-{uuid}` pattern for objectId to prevent conflicts with model objects.

### Text Rendering

Use Three.js TextGeometry with bundled font (not CSS overlays) for consistent 3D integration.

### Font Requirements

Bundle a single font file (e.g., Roboto) supporting Latin + Arabic glyphs, loaded once per session.

### Color Application

Store hex color string in `AnnotationInstance.color`. Apply to `MeshStandardMaterial.color` at render time.
