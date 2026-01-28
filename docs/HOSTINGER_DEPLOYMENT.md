# Hostinger Deployment Guide

## Overview

PWAssemblyGuide is deployed on **Hostinger Premium** hosting with a hybrid architecture:

- **Frontend:** Static Next.js export (HTML/CSS/JS)
- **Backend:** PHP API layer for admin operations
- **Data:** JSON files for cabinet/step content

This architecture was chosen over Vercel serverless deployment due to the need for file write operations (saving animations, cabinet data) which are not supported on read-only serverless filesystems.

---

## Hosting Environment

### Hostinger Premium Specifications

- **Provider:** Hostinger Premium
- **PHP Version:** 8.3.16
- **Web Server:** LiteSpeed
- **Node.js:** Not available (static export only)
- **Account Valid Until:** February 13, 2028
- **Domain:** https://mlextensions.com
- **Deployment Path:** `/home/u600654652/domains/mlextensions.com/public_html/`

### Directory Structure on Server

```folder
public_html/
├── index.html                    # Next.js static home page
├── _next/                        # Next.js static assets
│   ├── static/
│   └── ...
├── cabinet/                      # Static pages for cabinets
│   └── [id]/
│       ├── index.html
│       └── step/
│           └── [stepId]/
│               └── index.html
├── admin/                        # Admin panel static pages
│   ├── index.html
│   ├── login/
│   │   └── index.html
│   └── cabinets/
│       └── [id]/
│           ├── edit/
│           │   └── index.html
│           └── steps/
│               ├── authoring/
│               │   └── index.html
│               └── ...
├── php-api/                      # PHP backend (created manually)
│   ├── auth.php
│   ├── cabinets.php
│   ├── categories.php
│   ├── config.php
│   ├── upload.php
│   └── admin/
│       └── animation.php
├── data/                         # JSON data storage
│   ├── cabinets-index.json
│   ├── categories.json
│   └── cabinets/
│       ├── BC-002.json
│       └── BC-003.json
├── public/                       # Static assets
│   ├── models/
│   ├── audio/
│   ├── images/
│   └── locales/
├── .htaccess                     # Apache routing configuration
└── animation_save.log            # Debug log (production)
```

---

## Deployment Architecture

### Why Not Vercel?

**Initial Plan:** Deploy to Vercel using static export (`output: 'export'`)

**Problem Discovered:** Vercel serverless functions run on a read-only filesystem. When attempting to save animations via `/api/admin/cabinets/[id]/steps/[stepId]/animation`, we received 500 errors because:

```message
Error: EROFS: read-only file system, open '/data/cabinets/BC-003.json'
```

**Solution:** Pivot to Hostinger Premium hosting with traditional PHP backend, which has full filesystem write access.

### Architecture Decision

| Component    | Technology                 | Rationale                                        |
| ------------ | -------------------------- | ------------------------------------------------ |
| Frontend     | Next.js Static Export      | Fast, SEO-friendly, works on any static host     |
| Backend      | PHP 8.3 API                | Hostinger supports PHP, allows file writes       |
| Data Storage | JSON Files                 | Simple, version-controllable, no database needed |
| Routing      | Apache .htaccess           | Handle Next.js dynamic routes in static mode     |
| Auth         | Token-based (localStorage) | Simple, stateless, works with PHP                |

---

## Build Process

### Local Development

```bash
# Install dependencies
npm install

# Run dev server (Next.js API routes work)
npm run dev
```

### Production Build

```bash
# Clean previous builds (avoids OneDrive file locking)
Remove-Item -Recurse -Force .next,out

# Build static export
npm run build
```

**Output:** `out/` folder contains all static HTML/CSS/JS files

### Build Configuration

`next.config.js`:

```javascript
module.exports = {
  output: "export", // Static HTML export
  images: {
    unoptimized: true, // No server-side image optimization
  },
  trailingSlash: true, // Better Apache compatibility
};
```

**Key Points:**

- Next.js API routes (pages/api/\*) are NOT included in static export
- All API calls must target PHP endpoints at `/php-api/*`
- Dynamic routes become static template folders: `cabinet/[id]/` → `cabinet/[id]/index.html`

---

## PHP API Backend

### Endpoints

All endpoints are standalone (no shared dependencies) for maximum reliability.

| Endpoint                        | Method   | Purpose              | Auth Required |
| ------------------------------- | -------- | -------------------- | ------------- |
| `/php-api/auth.php`             | POST     | Login authentication | No            |
| `/php-api/auth.php?validate`    | GET/POST | Token validation     | No\*          |
| `/php-api/cabinets.php`         | GET      | List all cabinets    | No            |
| `/php-api/cabinets.php?id={id}` | GET      | Get single cabinet   | No            |
| `/php-api/cabinets.php`         | POST     | Create cabinet       | Yes           |
| `/php-api/cabinets.php?id={id}` | PUT      | Update cabinet       | Yes           |
| `/php-api/cabinets.php?id={id}` | DELETE   | Delete cabinet       | Yes           |
| `/php-api/categories.php`       | GET      | Get categories       | No            |
| `/php-api/upload.php`           | POST     | Upload files         | Yes           |
| `/php-api/admin/animation.php`  | POST     | Save step animation  | Yes\*\*       |

\*Token validation endpoint temporarily skips auth for debugging  
\*\*Animation endpoint auth currently disabled for debugging (needs re-enablement)

### Data Format: Wrapper Structure

**Critical:** PHP returns arrays wrapped in an object to match Next.js expectations.

**cabinets-index.json:**

```json
{
  "cabinets": [
    { "id": "BC-002", "name": "Base Cabinet 2" },
    { "id": "BC-003", "name": "Base Cabinet 3" }
  ]
}
```

**PHP handling:**

```php
// Read
$indexData = readJSON(CABINETS_INDEX);
$cabinets = $indexData['cabinets'] ?? $indexData ?? [];

// Write
writeJSON(CABINETS_INDEX, ['cabinets' => $index]);
```

**JavaScript fetch:**

```typescript
const response = await fetch("/api/cabinets");
const cabinets = await response.json(); // Expects array directly
```

### Cache Prevention

**Problem:** LiteSpeed server was caching API responses with `max-age=604800` (7 days), causing stale data.

**Solution:**

1. **PHP Headers** (in all endpoints):

   ```php
   header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
   header('Pragma: no-cache');
   header('Expires: 0');
   ```

2. **Client-side Cache Busting**:

```typescript
const response = await fetch(`/api/cabinets?id=${id}&_=${Date.now()}`, {
  cache: "no-store",
});
```

### Authentication

**Mechanism:** Token-based with localStorage persistence

**Flow:**

1. User enters password in `/admin/login`
2. PHP validates password (`admin123` hardcoded)
3. Server returns token (bcrypt hash)
4. Client stores token in localStorage
5. Subsequent requests include `Authorization: Bearer {token}` header

**PHP Validation:**

```php
function verifyAuth() {
  $headers = getallheaders();
  $auth = $headers['Authorization'] ?? '';
  if (strpos($auth, 'Bearer ') === 0) {
    $token = substr($auth, 7);
    // Verify token against stored hash
    return password_verify('admin123', $token);
  }
  return false;
}
```

**Note:** Animation endpoint currently has auth bypassed:

```php
function verifyAuth() {
  return true;  // TODO: Re-enable for production
}
```

---

## Apache Configuration (.htaccess)

### Purpose

Apache needs to route Next.js dynamic routes (e.g., `/cabinet/BC-003/step/4/`) to their static template folders (`/cabinet/[id]/step/[stepId]/index.html`).

### Key Rules

**Authorization Header Pass-through:**

```apache
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

_Required because Apache strips Authorization header by default_

**Dynamic Route Mapping Examples:**

```apache
# Cabinet detail page
RewriteRule ^cabinet/([^/]+)/?$ cabinet/[id]/index.html [L,QSA]

# Step viewer page
RewriteRule ^cabinet/([^/]+)/step/([^/]+)/?$ cabinet/[id]/step/[stepId]/index.html [L,QSA]

# Admin authoring tool
RewriteRule ^admin/cabinets/([^/]+)/steps/authoring/?$ admin/cabinets/[id]/steps/authoring/index.html [L,QSA]
```

**API Routing:**

```apache
# PHP-API passthrough (no rewrite needed)
RewriteCond %{REQUEST_URI} ^/php-api/
RewriteRule ^ - [L]
```

### Complete .htaccess

Located at: `public_html/.htaccess` (deployed manually, not in `out/` folder)

---

## Deployment Steps

### 1. Build Static Export Locally

```powershell
# Navigate to project
cd "C:\Users\mlame\OneDrive\BBA_Server\Projects\023 - Power Wood\AssemblyGuide"

# Clean previous builds
Remove-Item -Recurse -Force .next,out

# Build
npm run build
```

**Verify:** `out/` folder created with 16 static pages

### 2. Upload Static Files to Hostinger

**Method:** FTP, SFTP, or Hostinger File Manager

**Upload:**

- `out/` contents → `public_html/` (replace existing HTML/JS/CSS)
- Keep existing `php-api/`, `data/`, `.htaccess` (do NOT overwrite)

**Files to Upload:**

```folder
out/_next/          → public_html/_next/
out/admin/          → public_html/admin/
out/cabinet/        → public_html/cabinet/
out/categories/     → public_html/categories/
out/images/         → public_html/images/
out/locales/        → public_html/locales/
out/models/         → public_html/models/
out/index.html      → public_html/index.html
out/manifest.json   → public_html/manifest.json
out/404.html        → public_html/404.html
```

**Files to KEEP (do not overwrite):**

```folder
public_html/php-api/
public_html/data/
public_html/.htaccess
public_html/animation_save.log
```

### 3. Verify PHP API Endpoints

**Test URLs:**

```urls
https://mlextensions.com/php-api/cabinets.php
https://mlextensions.com/php-api/categories.php
https://mlextensions.com/php-api/auth.php
```

**Expected:** JSON responses, no 500 errors

### 4. Test Admin Panel

1. Navigate to https://mlextensions.com/admin/login
2. Login with password: `admin123`
3. Verify cabinet list loads
4. Edit a cabinet step
5. Open authoring tool
6. Save animation
7. Check `data/cabinets/{id}.json` updated

### 5. Test Public Pages

1. Navigate to https://mlextensions.com/cabinet/BC-003/step/4/
2. Verify animation plays correctly
3. Check audio narration works
4. Test language switching (EN ↔ AR)
5. Hard refresh (Ctrl+Shift+R) to clear cache

---

## Data Flow

### Public User Flow (Step Viewer)

```flow
User scans QR code
  ↓
Browser loads /cabinet/BC-003/step/4/ (static HTML)
  ↓
JavaScript executes, calls fetch('/api/cabinets?id=BC-003')
  ↓
Apache rewrites to /php-api/cabinets.php?id=BC-003
  ↓
PHP reads data/cabinets/BC-003.json
  ↓
Returns JSON with animation data
  ↓
Three.js renders 3D model and plays animation
```

### Admin User Flow (Animation Authoring)

```flow
Admin logs in
  ↓
Token stored in localStorage
  ↓
Admin opens /admin/cabinets/BC-003/steps/authoring?step=4
  ↓
JavaScript loads cabinet data via fetch('/api/cabinets?id=BC-003')
  ↓
Admin edits animation in 3D viewer
  ↓
Clicks "Save Animation"
  ↓
POST to /php-api/admin/animation.php with Authorization header
  ↓
PHP verifies token, updates data/cabinets/BC-003.json
  ↓
Writes 88,777 bytes, logs to animation_save.log
  ↓
Returns success response
```

---

## File Permissions

### Required Permissions

```bash
# Data folder (writable)
chmod 755 data/
chmod 755 data/cabinets/
chmod 644 data/cabinets/*.json
chmod 644 data/cabinets-index.json

# Public assets (readable)
chmod 755 public/
chmod 755 public/models/
chmod 644 public/models/*.glb
```

**Note:** Hostinger file manager defaults to 755/644 automatically

---

## Debugging

### Common Issues

**1. 500 Error on API Calls**

- Check PHP error logs in Hostinger control panel
- Verify file paths in PHP code match server structure
- Ensure Authorization header is passed (check .htaccess)

**2. Stale Data After Saving**

- Clear browser cache (Ctrl+Shift+R)
- Check `animation_save.log` for successful writes
- Verify no LiteSpeed cache plugins enabled
- Test direct API URL: `https://mlextensions.com/php-api/cabinets.php?id=BC-003`

**3. Authentication Failures**

- Check browser console for Authorization header
- Verify token in localStorage: `localStorage.getItem('authToken')`
- Test auth bypass: Set `verifyAuth() { return true; }` in PHP

**4. 404 on Dynamic Routes**

- Verify .htaccess is uploaded and active
- Check Apache mod_rewrite is enabled (Hostinger default: yes)
- Test with simple route first: `/cabinet/BC-003/`

**5. Animation Not Playing**

- Check browser console for WebGL errors
- Verify GLB model exists: `public/models/{modelId}.glb`
- Test animation data structure in JSON file
- Ensure step has `animation` property with `duration`, `objectKeyframes`, `cameraKeyframes`

### Debug Logs

**PHP Error Log:**
Hostinger Control Panel → Files → Error Log

**Animation Save Log:**
`public_html/animation_save.log`

```message
[2026-01-27 23:48:15] POST /php-api/admin/animation.php
Payload size: 42857 bytes
Cabinet: BC-003, Step: 4
File written: 88777 bytes
```

**Browser Console:**

```javascript
// Check loaded cabinet data
console.log(cabinet);

// Check animation object
console.log(cabinet.steps.find((s) => s.id === "4")?.animation);

// Check API response
fetch("/api/cabinets?id=BC-003")
  .then((r) => r.json())
  .then(console.log);
```

---

## Performance Considerations

### Static Export Benefits

- **Fast Page Loads:** Pre-rendered HTML, no server rendering
- **CDN Compatible:** All assets are static files
- **Low Server Load:** PHP only runs for API calls
- **Offline PWA Ready:** Service workers can cache static files (Phase 9)

### Optimization Applied

1. **Timeline Rendering Memoization:** `useMemo` for keyframe maps
2. **Object Lookup Caching:** Map data structure instead of array.find()
3. **Quaternion Reuse:** Reduce garbage collection in animation loop
4. **Lazy Loading:** Three.js models loaded on demand
5. **Cache Busting:** Timestamp parameters prevent stale data

### Recommended Hostinger Settings

- **LiteSpeed Cache:** Disable for `/php-api/*` and `/api/*` paths
- **Gzip Compression:** Enable for HTML/CSS/JS
- **Browser Caching:** Enable for static assets (`_next/`, `models/`, `images/`)
- **PHP OpCache:** Enable (Hostinger default)

---

## Migration from Vercel to Hostinger Timeline

**January 27, 2026:**

1. **Initial Attempt:** Build static export for Vercel deployment
2. **Discovered Issue:** Animation save returns 500 error (read-only filesystem)
3. **Decision:** Pivot to Hostinger Premium (valid until 2028, supports PHP)
4. **Implementation:** Created complete PHP API layer (6 endpoints)
5. **Challenge:** Data wrapper structure mismatch (PHP array vs JS object)
6. **Fix:** Wrapped PHP arrays in `{'cabinets': [...]}` object
7. **Challenge:** Browser caching (7-day max-age from LiteSpeed)
8. **Fix:** Added no-cache headers + timestamp query parameters
9. **Challenge:** Authorization header not passed to PHP
10. **Fix:** Added .htaccess rewrite rules
11. **Challenge:** Authoring tool not loading existing animations
12. **Fix:** Added useEffect to load animation on step data mount
13. **Challenge:** Step viewer using build-time bundled data
14. **Fix:** Replaced `getCabinet()` import with API fetch
15. **Success:** Full deployment working with real-time updates

**January 28, 2026:**

- Documentation updated to reflect Hostinger deployment architecture
- All systems operational: admin panel, authoring tool, public viewers

---

## Security Considerations

### Current State

⚠️ **Authentication Temporarily Weakened**

The animation endpoint has auth bypassed for debugging:

```php
// php-api/admin/animation.php
function verifyAuth() {
  return true;  // TODO: Re-enable
}
```

**Before Production:**

1. Remove bypass: Uncomment proper verifyAuth() logic
2. Check Authorization header properly passed
3. Test admin save operations with real token
4. Update password from hardcoded `admin123` to environment variable

### Recommended Improvements

1. **Environment Variables:**

   ```php
   // Instead of hardcoded password
   $PASSWORD = getenv('ADMIN_PASSWORD') ?: 'admin123';
   ```

2. **Rate Limiting:**
   - Implement login attempt throttling
   - IP-based rate limits on PHP-API

3. **HTTPS Only:**
   - Hostinger provides free SSL (Let's Encrypt)
   - Verify all pages serve over HTTPS

4. **File Upload Validation:**
   - Check MIME types in upload.php
   - Limit file sizes
   - Sanitize filenames

5. **CORS Headers:**

   ```php
   header('Access-Control-Allow-Origin: https://mlextensions.com');
   ```

---

## Future Enhancements

### Planned Improvements

1. **Database Migration:**
   - Replace JSON files with MySQL/SQLite
   - Better concurrent write handling
   - Full-text search for cabinets

2. **CDN Integration:**
   - Host GLB models on Cloudflare R2
   - Cache static assets globally

3. **Automated Deployment:**
   - GitHub Actions → SFTP to Hostinger
   - Auto-build on push to main branch

4. **Admin Features:**
   - Bulk animation export/import
   - Version history for cabinet data
   - Multi-user support with roles

5. **Performance:**
   - Implement service worker for offline PWA
   - Lazy load admin panel chunks
   - WebP images for thumbnails

---

## Troubleshooting Checklist

Before contacting support, verify:

- [ ] PHP version is 8.3+ (check Hostinger control panel)
- [ ] .htaccess file is in public_html root
- [ ] Authorization header rewrite rules are present
- [ ] data/ folder has 755 permissions
- [ ] JSON files have 644 permissions
- [ ] Browser cache is cleared (Ctrl+Shift+R)
- [ ] API endpoints return JSON (test direct URL)
- [ ] No PHP errors in Hostinger error log
- [ ] GLB models exist in public/models/
- [ ] Audio files exist in public/audio/

---

## Support Resources

- **Hostinger Docs:** https://support.hostinger.com
- **Next.js Static Export:** https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
- **Three.js Docs:** https://threejs.org/docs/
- **Project Docs:** See `/docs/` folder for detailed implementation guides

---

## Changelog

**2026-01-28:** Initial documentation created  
**2026-01-27:** Hostinger deployment completed, PHP API implemented  
**2026-01-27:** Vercel deployment abandoned due to filesystem limitations
