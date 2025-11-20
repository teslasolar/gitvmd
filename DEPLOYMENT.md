# GitVMD GitHub Pages Deployment Guide

## Repository Setup

**Repository**: `teslasolar/gitvmd`
**Branch**: `claude/research-github-pages-01HknUMBoHH3aqGmF4LshUiP`

## Deployment URLs

Once deployed to GitHub Pages:

```
# Root landing page
https://teslasolar.github.io/gitvmd/

# OS Selector
https://teslasolar.github.io/gitvmd/public/

# Direct OS boot
https://teslasolar.github.io/gitvmd/public/?os=minimal
https://teslasolar.github.io/gitvmd/public/?os=dev-env
https://teslasolar.github.io/gitvmd/public/?os=scada
https://teslasolar.github.io/gitvmd/public/?os=ai-desktop
```

## GitHub Pages Settings

1. Go to repository Settings
2. Navigate to "Pages" section
3. Set source to: **Deploy from branch**
4. Select branch: `claude/research-github-pages-01HknUMBoHH3aqGmF4LshUiP`
5. Set folder: **/ (root)**
6. Click Save

## Required Files for GitHub Pages

### ✅ Created

- `.nojekyll` - Disables Jekyll processing
- `_config.yml` - GitHub Pages configuration
- `public/.htaccess` - Apache configuration (if applicable)
- `public/_headers` - Security headers

### HTML Headers

All HTML files include:
```html
<!-- GitVMD [Page] | Hosted on GitHub Pages -->
<meta name="generator" content="GitVMD v1.0.0">
<meta name="repository" content="https://github.com/teslasolar/gitvmd">
```

## Path Resolution

The boot loader tries multiple paths for OS configs:
1. `/views/os/${osType}.json`
2. `../views/os/${osType}.json`
3. `../../views/os/${osType}.json`

This handles GitHub Pages subdirectory routing automatically.

## Local Testing

### Option 1: Python HTTP Server
```bash
cd gitvmd
python3 -m http.server 8000

# Visit:
# http://localhost:8000/
# http://localhost:8000/public/
# http://localhost:8000/public/?os=scada
```

### Option 2: Node.js HTTP Server
```bash
npm install -g http-server
cd gitvmd
http-server -p 8000

# Visit:
# http://localhost:8000/
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Troubleshooting

### Issue: 404 on OS JSON files

**Solution**: Check browser console for attempted paths. The boot loader logs each attempt.

**Fix**: Ensure `.nojekyll` exists and `_config.yml` includes `views` folder.

### Issue: CORS errors

**Solution**: GitHub Pages serves with proper CORS headers automatically. If testing locally, use `http-server -p 8000 --cors`.

### Issue: CSS/JS not loading

**Solution**: Check paths are relative, not absolute. Use `./` or `../` prefixes.

## File Structure on GitHub Pages

```
https://teslasolar.github.io/gitvmd/
├── index.html                 (landing page)
├── js/landing.js
├── styles/landing.css
├── public/
│   ├── index.html            (OS selector)
│   ├── js/
│   │   ├── boot.js
│   │   ├── index.js
│   │   ├── main.js
│   │   └── vm-engine.js
│   └── styles/
│       ├── main.css
│       └── os.css
├── views/
│   ├── os/
│   │   ├── minimal.json
│   │   ├── dev-env.json
│   │   ├── scada.json
│   │   └── ai-desktop.json
│   ├── overview.json
│   └── process-detail.json
└── components/
    ├── symbols/
    ├── chart/
    ├── input/
    ├── display/
    └── container/
```

## Post-Deployment Checklist

- [ ] Landing page loads at root URL
- [ ] OS selector accessible at `/public/`
- [ ] All 4 OS variants boot successfully
- [ ] Desktop environment renders correctly
- [ ] Windows are draggable
- [ ] Terminal responds to commands
- [ ] SCADA views load (overview, process-detail)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Keyboard shortcuts work (S, D keys)

## GitHub Actions (Optional)

To add automated deployment, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [claude/research-github-pages-01HknUMBoHH3aqGmF4LshUiP]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Custom Domain (Optional)

1. Add `CNAME` file to root:
```
gitvmd.yourdomain.com
```

2. Configure DNS:
```
Type: CNAME
Name: gitvmd
Value: teslasolar.github.io
```

3. Enable HTTPS in GitHub Pages settings

## Performance Tips

- GitHub Pages uses Fastly CDN
- All assets cached automatically
- Gzip compression enabled by default
- Keep total size under 1GB
- Keep individual files under 100MB

## Support

If deployment fails:
1. Check GitHub Pages settings
2. Verify branch name matches
3. Check `.nojekyll` exists
4. Review GitHub Actions logs (if using)
5. Test locally first

---

**Ready to deploy!** Just enable GitHub Pages in repository settings.
