# Hostinger Premium Deployment Guide

## ✅ Solution: Static Next.js + PHP API

Since Hostinger Premium doesn't support Node.js, we're using:

- **Frontend:** Static HTML/CSS/JS (built from Next.js)
- **API:** PHP scripts for admin operations
- **Storage:** JSON files (your existing data structure)

## Step 1: Build the Application

## Step 1: Build the Application

```bash
# In your project directory
npm run build
```

This creates optimized static files in the `out/` directory (or `.next/` if using standalone).

---

## Step 2: Set Admin Password

Edit `php-api/auth.php` and change the admin password:

```php
// Line 7 in php-api/auth.php
if ($password === 'YOUR_SECURE_PASSWORD_HERE') {
```

**Important:** Replace `'YOUR_SECURE_PASSWORD_HERE'` with your actual admin password.

---

## Step 3: Upload Files to Hostinger

### Via File Manager (Easiest)

1. **Login to Hostinger hPanel**
2. **Click "File Manager"**
3. **Navigate to `public_html/`**
4. **Delete default files** (index.html, etc.)
5. **Upload these folders/files:**
   - `out/` → Extract contents directly into `public_html/`
   - `php-api/` → Upload entire folder to `public_html/php-api/`
   - `data/` → Upload entire folder to `public_html/data/`
   - `public/` → Upload entire folder to `public_html/public/`
   - `.htaccess` → Upload to `public_html/.htaccess`

### Via FTP (FileZilla)

1. **Get FTP credentials** from Hostinger hPanel
2. **Connect with FileZilla**
3. **Upload same files** as above

---

## Step 4: Set File Permissions

**In Hostinger File Manager:**

1. Right-click on `data/` folder
2. Select "Permissions" or "Change Permissions"
3. Set to **755** (Read, Write, Execute for owner)
4. Check "Apply to subdirectories"

This allows PHP to write JSON files.

---

## Step 5: Test the Deployment

### Test Public Pages

- `https://your-domain.com` → Home page
- `https://your-domain.com/cabinet/BC-002` → Cabinet page
- `https://your-domain.com/cabinet/BC-002/step/1` → Step viewer

### Test Admin Panel

- `https://your-domain.com/admin/login` → Login page
- Login with your password
- Try creating/editing a cabinet
- Try the animation authoring tool

---

## Step 6: Verify API Endpoints

Open browser console and check:

```javascript
// Test categories API
fetch("https://your-domain.com/api/categories")
  .then((r) => r.json())
  .then(console.log);

// Test cabinets API
fetch("https://your-domain.com/api/cabinets")
  .then((r) => r.json())
  .then(console.log);
```

---

## Directory Structure on Hostinger

```folder
public_html/
├── .htaccess                    # URL rewrites
├── php-api/                     # PHP API scripts
│   ├── config.php              # Configuration
│   ├── auth.php                # Authentication
│   ├── cabinets.php            # Cabinet CRUD
│   ├── categories.php          # Categories
│   ├── upload.php              # File uploads
│   └── admin/
│       └── animation.php       # Animation save
├── data/                        # JSON data (writable)
│   ├── cabinets-index.json
│   ├── categories.json
│   └── cabinets/
│       ├── BC-002.json
│       └── BC-003.json
├── public/                      # Static assets
│   ├── models/
│   ├── audio/
│   └── images/
├── _next/                       # Next.js assets
│   ├── static/
│   └── ...
├── index.html                   # Home page
├── admin/                       # Admin pages
│   └── login.html
└── cabinet/                     # Cabinet pages
    └── [id].html
```

---

## Troubleshooting

### "500 Internal Server Error"

1. Check `.htaccess` syntax
2. Enable error reporting in `php-api/config.php`:

   ```php
   error_reporting(E_ALL);
   ini_set('display_errors', 1);
   ```

3. Check PHP error logs in hPanel

### "Permission Denied" when saving

1. Set `data/` folder permissions to 755 or 777
2. Check folder ownership in File Manager

### API not working

1. Verify `.htaccess` RewriteRules
2. Check if `mod_rewrite` is enabled (usually enabled on Hostinger)
3. Test PHP files directly: `https://your-domain.com/php-api/cabinets.php`

### Missing styles/images

1. Check that `_next/` folder uploaded correctly
2. Verify `public/` folder is in the right location
3. Clear browser cache

---

## Performance Optimization

### Enable Cloudflare (Free CDN)

1. **In Hostinger hPanel** → Click "Cloudflare"
2. **Enable Cloudflare** for your domain
3. **Benefits:**
   - Faster global access
   - Free SSL
   - DDoS protection
   - Cached static files

### Enable OPcache

1. **In hPanel** → "PHP Configuration"
2. **Enable OPcache** extension
3. **Faster PHP execution**

---

## Maintenance

### Update Content

1. Edit JSON files in `data/` folder via File Manager
2. Or use the admin panel at `https://your-domain.com/admin`

### Deploy Updates

1. Run `npm run build` locally
2. Upload new `out/` files to `public_html/`
3. Keep `data/` folder (don't overwrite)

---

## Security Recommendations

1. **Change admin password** in `php-api/auth.php`
2. **Enable HTTPS** via Hostinger (free SSL included)
3. **Limit admin access** by IP (optional, in .htaccess)
4. **Regular backups** of `data/` folder

---

## Cost

- ✅ **FREE** - Uses your existing Hostinger Premium plan
- ✅ No upgrade needed
- ✅ All features work perfectly

---

## Next Steps

1. ✅ Build the app: `npm run build`
2. ✅ Set admin password in `php-api/auth.php`
3. ✅ Upload files to Hostinger
4. ✅ Set `data/` permissions to 755
5. ✅ Test the deployment
6. ✅ Enable Cloudflare for CDN

---

## Alternative: Keep Vercel for Viewer Only

If you want the fastest possible viewer experience:

1. **Vercel:** Deploy viewer pages (read-only)
   - Home, cabinet pages, step viewer
   - No admin panel

2. **Hostinger:** Deploy admin panel only
   - Full CRUD capabilities
   - Admin at `https://admin.your-domain.com`

This gives you:

- ⚡ Blazing fast viewer on Vercel's global CDN
- 💾 Full admin functionality on Hostinger
- 🔄 Sync data via API between both

Let me know if you want this hybrid setup instead!
