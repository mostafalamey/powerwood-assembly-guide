# Data Structure Documentation

## Overview

The application uses a split data structure to optimize performance and maintainability:

1. **Cabinet Index**: Stores basic metadata for all cabinets
2. **Individual Cabinet Files**: Store detailed step and animation data for each cabinet

## File Structure

```folder
data/
├── cabinets-index.json          # Main index with all cabinet metadata
└── cabinets/                    # Individual cabinet step/animation files
    ├── BC-002.json
    ├── BC-003.json
    └── ...
```

## Cabinet Index (`cabinets-index.json`)

Contains an array of cabinet metadata objects. This file is used for:

- Listing all cabinets in the admin panel
- Category browsing
- Search functionality
- Quick overview without loading heavy animation data

### Structure

```json
{
  "cabinets": [
    {
      "id": "BC-002",
      "name": {
        "en": "2-Door Base Cabinet 36\"",
        "ar": "خزانة أرضية بابين 36 بوصة"
      },
      "category": "base",
      "estimatedTime": 25,
      "image": "/images/cabinets/BC-002.png",
      "model": "/models/BC_002.glb",
      "description": {
        "en": "Standard 2-door base cabinet with adjustable shelf",
        "ar": "خزانة أرضية قياسية بابين مع رف قابل للتعديل"
      },
      "stepCount": 6
    }
  ]
}
```

### Fields

| Field            | Type   | Required | Description                                |
| ---------------- | ------ | -------- | ------------------------------------------ |
| `id`             | string | Yes      | Unique cabinet identifier                  |
| `name.en`        | string | Yes      | English name                               |
| `name.ar`        | string | Yes      | Arabic name                                |
| `category`       | string | Yes      | Cabinet category (base, wall, tall, etc.)  |
| `estimatedTime`  | number | Yes      | Estimated assembly time in minutes         |
| `description.en` | string | No       | English description                        |
| `description.ar` | string | No       | Arabic description                         |
| `model`          | string | No       | Path to 3D model file                      |
| `image`          | string | No       | Path to thumbnail image                    |
| `stepCount`      | number | No       | Number of assembly steps (auto-calculated) |

## Cabinet Steps Files (`cabinets/{id}.json`)

Contains detailed step and animation data for a specific cabinet. These files are:

- Loaded only when viewing a specific cabinet
- Can be quite large due to animation keyframes
- Separate from the index to improve performance

### Structure

```json
{
  "id": "BC-002",
  "steps": [
    {
      "id": "1",
      "title": {
        "en": "Attach one leg to base panel",
        "ar": "تثبيت ساق واحدة على اللوحة الأساسية"
      },
      "description": {
        "en": "Detailed instructions...",
        "ar": "تعليمات مفصلة..."
      },
      "duration": 3,
      "animation": {
        "duration": 19000,
        "keyframes": [...],
        "camera": {
          "keyframes": [...]
        }
      }
    }
  ]
}
```

### Step Fields

| Field            | Type   | Required | Description                                 |
| ---------------- | ------ | -------- | ------------------------------------------- |
| `id`             | string | Yes      | Step identifier (usually sequential)        |
| `title.en`       | string | Yes      | English step title                          |
| `title.ar`       | string | Yes      | Arabic step title                           |
| `description.en` | string | Yes      | English step instructions                   |
| `description.ar` | string | Yes      | Arabic step instructions                    |
| `duration`       | number | No       | Expected step duration in minutes           |
| `animation`      | object | No       | 3D animation data (see Animation Structure) |

### Animation Structure

See [KEYFRAME_ANIMATION.md](./KEYFRAME_ANIMATION.md) for detailed animation structure documentation.

## API Behavior

### GET `/api/cabinets`

Returns all cabinets from `cabinets-index.json` (metadata only, no steps).

### GET `/api/cabinets?id={cabinetId}`

Returns cabinet metadata merged with steps from `cabinets/{id}.json` if it exists.

### POST `/api/cabinets`

1. Separates `steps` from cabinet metadata
2. Saves metadata to `cabinets-index.json`
3. Calculates and stores `stepCount`
4. Saves steps to `cabinets/{id}.json` if steps exist

### PUT `/api/cabinets`

1. Separates `steps` from cabinet metadata
2. Updates metadata in `cabinets-index.json`
3. Updates `stepCount`
4. Updates or creates `cabinets/{id}.json`
5. Deletes `cabinets/{id}.json` if no steps provided

### DELETE `/api/cabinets?id={cabinetId}`

1. Removes cabinet from `cabinets-index.json`
2. Deletes `cabinets/{id}.json` if it exists

## Migration Notes

### From Old Structure (`cabinets.json`)

The old `cabinets.json` file contained all cabinet data including steps and animations in a single file. This has been deprecated in favor of the split structure.

To migrate existing data:

1. Extract each cabinet's metadata (without steps) to `cabinets-index.json`
2. Add `stepCount` field to each cabinet metadata
3. Save each cabinet's steps array to `data/cabinets/{id}.json`

### Benefits of New Structure

1. **Performance**: Index loads quickly without heavy animation data
2. **Scalability**: Adding more cabinets doesn't slow down list view
3. **Maintainability**: Easier to edit individual cabinet animations
4. **Modularity**: Steps can be managed independently
5. **Version Control**: Smaller file changes for better git diffs

## TypeScript Interfaces

```typescript
// Cabinet metadata (from index)
interface Cabinet {
  id: string;
  name: { en: string; ar: string };
  category: string;
  model: string;
  description?: { en: string; ar: string };
  steps?: Step[]; // Populated when loading individual cabinet
  stepCount?: number;
  tools?: { en: string[]; ar: string[] };
  estimatedTime?: string | number;
  image?: string;
}

// Separate file structure
interface CabinetStepsData {
  id: string;
  steps: Step[];
}
```

See [cabinet.ts](../types/cabinet.ts) for complete type definitions.
