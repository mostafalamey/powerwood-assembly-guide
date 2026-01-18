# 3D Models Directory

This directory contains the GLB 3D models for cabinet assembly steps.

## File Structure

- Each cabinet has a main GLB file (e.g., BC-001.glb)
- Individual steps may have their own GLB files for specific views
- Models should be optimized for web viewing (< 5MB each)

## Creating Models

1. Export from SketchUp as Collada (.dae)
2. Import into Blender
3. Optimize geometry and textures
4. Export as GLB with Draco compression

## Naming Convention

- Main cabinet: `{CABINET_ID}.glb` (e.g., BC-001.glb)
- Step-specific: `{CABINET_ID}-step-{STEP_ID}.glb` (e.g., BC-001-step-1.glb)

## Placeholder

Until actual models are created, you can use:

- [Ready Player Me](https://readyplayer.me/) for character models
- [Sketchfab](https://sketchfab.com/) for free GLB models
- [Poly Haven](https://polyhaven.com/) for assets
