# Cabinet Data Structure

## Overview

Cabinet data has been split into individual files for easier maintenance. Each cabinet has its own JSON file with complete details including steps and animations.

## File Structure

```
data/
├── cabinets-index.json        # Metadata for all cabinets (fast loading)
├── cabinets-loader.ts          # Utility functions to load cabinet data
└── cabinets/
    ├── BC-002.json             # Individual cabinet file
    ├── BC-003.json
    └── ...
```

## Files

### `cabinets-index.json`
Contains metadata for all cabinets WITHOUT step details. Used for:
- Listing cabinets by category
- Display cabinet cards
- Fast initial page loads

**Structure:**
```json
{
  "cabinets": [
    {
      "id": "BC-002",
      "name": { "en": "...", "ar": "..." },
      "category": "base",
      "estimatedTime": 25,
      "image": "/images/cabinets/BC-002.png",
      "model": "/models/BC_002.glb",
      "description": { "en": "...", "ar": "..." },
      "stepCount": 6
    }
  ]
}
```

### `cabinets/[ID].json`
Individual cabinet file with complete details including all steps and animations.

**Example:** `cabinets/BC-002.json`

## Usage

### Import the loader

```typescript
import { getCabinet, getAllCabinets, getCabinetsByCategory } from '@/data/cabinets-loader';
```

### Get a specific cabinet (with all step details)

```typescript
const cabinet = getCabinet('BC-002');
// Returns: Cabinet object with steps, animations, etc.
```

### Get all cabinets (metadata only - fast)

```typescript
const cabinets = getAllCabinets();
// Returns: Array of cabinet metadata (no step details)
```

### Get cabinets by category

```typescript
const baseCabinets = getCabinetsByCategory('base');
// Returns: Array of cabinet metadata in the "base" category
```

### Get all cabinet IDs (for static generation)

```typescript
const ids = getAllCabinetIds();
// Returns: ['BC-002', 'BC-003', ...]
```

## Adding a New Cabinet

1. Create a new JSON file in `data/cabinets/` named with the cabinet ID (e.g., `BC-003.json`)
2. Follow the structure of existing cabinet files
3. Run the index generator to update `cabinets-index.json`:
   ```bash
   node scripts/generate-cabinet-index.js
   ```

## Converting from Old Format

If you have the old `cabinets.json` format, run:

```bash
node scripts/split-cabinets.js
```

This will:
- Create individual cabinet files in `data/cabinets/`
- Generate `cabinets-index.json`

## Benefits

1. **Easier editing** - Each cabinet in its own file (~200-500 lines instead of thousands)
2. **Better git diffs** - Changes to one cabinet don't affect others
3. **Faster loading** - Can load metadata without full step details
4. **Scalability** - Easy to add new cabinets without huge file
5. **Organization** - Clear file structure

## Migration

Old imports like:
```typescript
import cabinetsData from '@/data/cabinets.json';
const cabinet = cabinetsData.cabinets.find(c => c.id === 'BC-002');
```

Should be replaced with:
```typescript
import { getCabinet } from '@/data/cabinets-loader';
const cabinet = getCabinet('BC-002');
```
