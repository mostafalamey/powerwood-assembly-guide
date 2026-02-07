# Migration Guide: mlextensions.com → mlassemble.mlextensions.com

## Overview

This guide migrates the PWAssemblyGuide site from the main domain (`mlextensions.com`) to a subdomain (`mlassemble.mlextensions.com`) which points to the `public_html/mlassemble/` folder on Hostinger.

---

## What Changed in the Code (Already Done)

Only **2 files** were modified:

### 1. `.htaccess` — Added `RewriteBase /`

```apache
RewriteEngine On
RewriteBase /          ← NEW LINE
```

**Why:** When Apache serves a subdomain from a subfolder (`public_html/mlassemble/`), it can sometimes use the physical path (`/mlassemble/`) as the rewrite base instead of the URL path (`/`). Adding `RewriteBase /` ensures all URL rewrites work correctly relative to the subdomain root.

### 2. `php-api/upload.php` — Smarter upload path

**Why:** The old code hardcoded `__DIR__ . '/../public'` as the upload target. On Hostinger's static export, assets live directly in the web root (not in a `/public` subfolder). The fix uses `DOCUMENT_ROOT` (which Hostinger sets to `public_html/mlassemble/`) and only appends `/public` if that folder actually exists (local dev).

---

## Why Nothing Else Needs to Change

- **PHP API paths** — All use `__DIR__` with relative `../` navigation. Since the folder structure inside `mlassemble/` is identical to the old `public_html/` layout, all paths resolve correctly.
- **Frontend URLs** — No `basePath` or `assetPrefix` is set in `next.config.js`. All URLs (like `/api/assemblies`, `/models/BC-002.glb`) start with `/`, which resolves to the subdomain root.
- **CORS** — All PHP files use `Access-Control-Allow-Origin: *`, so the domain change doesn't affect API access.
- **`.htaccess` rewrite rules** — All rules use relative paths, no domain-specific references.

---

## Step-by-Step Migration

### Step 1: Configure the Subdomain on Hostinger

1. **Log in to Hostinger hPanel** → [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Domains** → **Subdomains**
3. Create subdomain: `mlassemble.mlextensions.com`
4. Set the **document root** to: `public_html/mlassemble`
5. Wait a few minutes for DNS to propagate (Hostinger subdomains are usually instant since they share the same DNS)

> **Note:** The `mlassemble` folder inside `public_html/` should already exist (you mentioned it does). If not, create it via File Manager.

### Step 2: Build the App Locally

Open a terminal in your project folder and run:

```bash
npm run build
```

This creates the `out/` folder with all static HTML, CSS, JS, and the contents of `public/` merged in.

### Step 3: Upload Files to `public_html/mlassemble/`

Use **Hostinger File Manager** (easiest) or **FTP (FileZilla)**.

Upload the following into `public_html/mlassemble/`:

| Source (your computer)         | Destination (Hostinger)            | Notes                                              |
| ------------------------------ | ---------------------------------- | -------------------------------------------------- |
| `out/*` (contents, not folder) | `public_html/mlassemble/`          | Extract all files/folders directly into mlassemble |
| `php-api/` folder              | `public_html/mlassemble/php-api/`  | Entire folder                                      |
| `data/` folder                 | `public_html/mlassemble/data/`     | Entire folder (JSON data files)                    |
| `config/` folder               | `public_html/mlassemble/config/`   | Entire folder (tenant.json)                        |
| `.htaccess`                    | `public_html/mlassemble/.htaccess` | The modified file (with RewriteBase /)             |

> **Important:** Upload the **contents** of `out/` directly into `mlassemble/`, NOT the `out/` folder itself. You should see `index.html`, `_next/`, `assembly/`, `admin/`, etc. directly inside `mlassemble/`.

### Step 4: Verify the Folder Structure

After uploading, your `public_html/mlassemble/` should look like this:

```
public_html/mlassemble/
├── .htaccess                     ← URL rewrites (with RewriteBase /)
├── index.html                    ← Home page (from out/)
├── 404.html                      ← 404 page (from out/)
├── _next/                        ← Next.js assets (from out/)
├── assembly/                     ← Assembly pages (from out/)
│   └── [id]/
├── categories/                   ← Category pages (from out/)
│   └── [category]/
├── admin/                        ← Admin pages (from out/)
│   ├── login/
│   └── assemblies/
├── php-api/                      ← PHP API scripts
│   ├── assemblies.php
│   ├── auth.php
│   ├── categories.php
│   ├── config.php
│   ├── upload.php
│   ├── annotations.php
│   ├── test.php
│   ├── admin/
│   │   └── animation.php
│   └── tenant/
│       └── branding.php
├── data/                         ← JSON data (writable)
│   ├── assemblies-index.json
│   ├── categories.json
│   └── assemblies/
│       ├── BC-002.json
│       └── BC-003.json
├── config/                       ← Tenant config (writable)
│   └── tenant.json
├── models/                       ← 3D models (from out/)
├── audio/                        ← Audio files (from out/)
├── images/                       ← Images (from out/)
├── logos/                        ← Logos (from out/)
├── favicons/                     ← Favicons (from out/)
├── locales/                      ← Translation files (from out/)
└── manifest.json                 ← PWA manifest (from out/)
```

### Step 5: Set File Permissions

In **Hostinger File Manager**:

1. Right-click on `public_html/mlassemble/data/` → **Permissions** → Set to **755**
   - Check **"Apply to subdirectories"**
2. Right-click on `public_html/mlassemble/config/` → **Permissions** → Set to **755**
   - Check **"Apply to subdirectories"**
3. Right-click on `public_html/mlassemble/models/` → **Permissions** → Set to **755**
   - (For file uploads via admin)
4. Right-click on `public_html/mlassemble/images/` → **Permissions** → Set to **755**
5. Right-click on `public_html/mlassemble/audio/` → **Permissions** → Set to **755**
6. Right-click on `public_html/mlassemble/logos/` → **Permissions** → Set to **755**
7. Right-click on `public_html/mlassemble/favicons/` → **Permissions** → Set to **755**

> Permissions 755 means: Owner can read/write/execute, everyone else can read/execute. This lets PHP create and modify files in these directories.

### Step 6: Test the Deployment

Open your browser and test these URLs:

#### Public Pages

- **Home:** `https://mlassemble.mlextensions.com`
- **Categories:** `https://mlassemble.mlextensions.com/categories/base`
- **Assembly:** `https://mlassemble.mlextensions.com/assembly/BC-002`

#### API Endpoints (paste in browser address bar)

- **PHP test:** `https://mlassemble.mlextensions.com/php-api/test.php`
- **Categories API:** `https://mlassemble.mlextensions.com/api/categories`
- **Assemblies API:** `https://mlassemble.mlextensions.com/api/assemblies`

#### Admin Panel

- **Login:** `https://mlassemble.mlextensions.com/admin/login`
- Log in, then test creating/editing assemblies
- Test file uploads (models, images)

---

## Troubleshooting

### "404 Not Found" on all pages

- Verify `.htaccess` is uploaded to `public_html/mlassemble/.htaccess`
- Check that `mod_rewrite` is enabled (usually enabled by default on Hostinger)
- Ensure the file isn't hidden — in File Manager, enable "Show Hidden Files"

### "500 Internal Server Error"

- Temporarily add this to the top of `.htaccess` for debugging:
  ```apache
  # Uncomment to debug
  # php_flag display_errors on
  ```
- Check that the `.htaccess` syntax is correct (no invisible characters from copy-paste)

### API returns errors or empty responses

- Test PHP directly: `https://mlassemble.mlextensions.com/php-api/test.php`
- If that works but `/api/assemblies` doesn't, the `.htaccess` rewrite rules aren't firing
- Check that `data/` folder has the JSON files and correct permissions (755)

### File uploads fail (admin panel)

- Check that target directories (`models/`, `images/`, `audio/`, `logos/`, `favicons/`) have 755 permissions
- Check PHP upload limits in Hostinger:
  - hPanel → **Advanced** → **PHP Configuration**
  - Set `upload_max_filesize` to at least `10M`
  - Set `post_max_size` to at least `12M`

### Styles/JS missing (page loads but looks broken)

- Verify `_next/` folder was uploaded completely to `public_html/mlassemble/_next/`
- Clear browser cache (Ctrl+Shift+R)

### Admin login doesn't work

- Check that `php-api/auth.php` is uploaded
- Verify the password in `auth.php` is what you expect

### Old site at mlextensions.com

- The old site in `public_html/` root will still work at `mlextensions.com`
- If you want to redirect the old domain to the subdomain, add this `.htaccess` in `public_html/`:
  ```apache
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^(www\.)?mlextensions\.com$ [NC]
  RewriteRule ^(.*)$ https://mlassemble.mlextensions.com/$1 [R=301,L]
  ```
- Or you can delete the old deployment files from `public_html/` root (keep the `mlassemble/` folder!)

---

## Updating the Site Later

When you make changes and need to redeploy:

1. Run `npm run build` locally
2. Upload new `out/*` contents to `public_html/mlassemble/`
3. Upload updated `php-api/` files if changed
4. **DO NOT overwrite** `data/` or `config/` folders (they contain your live data!)

---

## QR Codes

If you have existing QR codes pointing to `mlextensions.com/assembly/...`, you'll need to either:

1. **Update the QR codes** to point to `mlassemble.mlextensions.com/assembly/...`
2. **Set up a redirect** from the old domain (see Troubleshooting → "Old site" section above)
