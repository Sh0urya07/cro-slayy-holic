# cro_slayy_holic — 3D cinematic crochet site

A fully 3D, scroll-driven website: your logo stitches itself in (anime.js), then
the camera rides a **randomly-tangled yarn path** (regenerated every visit) through
a pastel world, past your products floating on velvet podiums. Tap any product to
open its details. Contact is **Instagram DM or email** only. Built to scale — add
products by editing one file.

## ▶ How to open it
Because it loads a few libraries and your product photos, open it with a tiny local
server (double-clicking `index.html` also works in most browsers, but a server is
safest):

```bash
cd cro_slayy_holic
python -m http.server 8000
# then visit  http://localhost:8000
```

## 🖼 Add your images (important)
The site is looking for these files. Save your photos into the **images/** folder
with these exact names:

| Save as | Which photo |
|---|---|
| `images/logo.png` | your round cro_slayy_holic logo / pfp |
| `images/electric-sleeve.jpg` | Pikachu mustard + brown sleeve |
| `images/fire-sleeve.jpg` | orange + green "Ember & Thread" sleeve |
| `images/ghost-sleeve.jpg` | purple + magenta Gengar clutch |
| `images/water-sleeve.jpg` | blue + cream Squirtle sleeve |

If a photo is missing the site still works — it shows a soft placeholder instead of
breaking.

## ➕ Add / edit products later (no coding)
Open **`data/products.js`** and copy one product block. Drop the photo in `images/`,
point `image:` at it, fill in `name`, `price` (or leave `"DM for price"`),
`description`, and `colors`. Save. A new 3D podium appears automatically.
Leave `products: []` empty and the room shows a cozy "coming soon" state.

## ⚙ Set your handle + email
Open **`js/config.js`** and put in her real Instagram handle and email. That's it —
every "DM" and "Email" button across the site updates.

## 🧩 File map
```
index.html        page shell + logo intro + overlay UI
css/style.css     all styling
js/config.js      << your instagram + email
js/logo.js        anime.js logo intro
js/main.js        3D world, randomized camera path, products, contact
data/products.js  << your products
images/           << your photos
```

## Notes
- A "reduce motion" toggle (bottom-right) turns off the flythrough for accessibility
  / older phones, and it auto-respects the system "reduce motion" setting.
- Works offline once the CDN libraries are cached; for a public site, host the folder
  on Netlify, Vercel, or GitHub Pages (all free, just drag-and-drop the folder).
