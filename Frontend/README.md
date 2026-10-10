# PrepX — Interview Practice Platform

A responsive React + Vite landing page for **PrepX — Your Interview, OUR Platform**. Designed so you can add Express, Node.js, and MongoDB later.

## Features

- Responsive navigation with 3 dropdown menus × 5 placeholder links each
- Get Started button with a replaceable `/get-started` destination
- Image/video slider with previous/next controls and indicators
- Optional Cloudinary URLs for hero image/video and founder portraits
- Two founder cards with editable bios
- Learn More link to `/about`
- Terms & Conditions modal (Escape key and backdrop close supported)
- Footer with contact, 24×7 support placeholder, address/map placeholder, and social icons
- Responsive styling and reduced-motion support

## Requirements

Install a current Node.js LTS version, then run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal. To check a production build:

```bash
npm run build
npm run preview
```

## Folder structure

```text
prepx-platform/
├── index.html
├── package.json
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```

## Customize the page

### 1. Add your links

In `src/App.jsx`:
- `menuGroups`: edit the 15 dropdown link labels and hrefs.
- `handleGetStarted`: change `/get-started` to your route when it exists.
- `href="/about"`: change to your About/Learn More route.
- Founder links currently go to `#contact`; replace if you create founder profile pages.

These are placeholder destinations. If you use React Router later, change the `<a>` tags to React Router `<Link>` elements and configure routes.

### 2. Use Cloudinary for images and videos

Yes. Cloudinary can host your hero media and founder photos. For this starter project:

1. Create a Cloudinary account.
2. Upload your images/videos in the Cloudinary Media Library.
3. Copy each asset's **delivery URL**.
4. Copy `.env.example` to `.env` in the project root.
5. Replace `YOUR_CLOUD_NAME` and sample paths with the exact URLs for your assets.
6. Restart the Vite dev server after editing `.env`.

The environment variables used by the page are:
- `VITE_CLOUDINARY_HERO_IMAGE`
- `VITE_CLOUDINARY_HERO_VIDEO`
- `VITE_CLOUDINARY_FOUNDER_ONE`
- `VITE_CLOUDINARY_FOUNDER_TWO`

Vite variables prefixed with `VITE_` are included in the browser bundle. **Only put public media delivery URLs here. Never put your Cloudinary API secret, private keys, or other secrets in a frontend `.env` file.** For private uploads, create a backend upload endpoint with server-side credentials or use Cloudinary's documented signed-upload flow.

The third slider item is an intentional placeholder. Add another Cloudinary URL or replace its copy in the `media` array.

### 3. Add your founder details

Edit the `founders` array in `src/App.jsx`: replace the names, roles, bios, and image URLs. Use photos you have permission to publish.

### 4. Add your address and map

The footer currently shows an address and map placeholder. Replace it with your business address. To embed a map, use an official Google Maps embed URL for the correct location, for example inside the footer:

```jsx
<iframe
  title="PrepX office location"
  src="YOUR_GOOGLE_MAPS_EMBED_URL"
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

Then add responsive iframe styles in `src/styles.css`. Check the location and privacy implications before publishing the map.

### 5. Social accounts and contact

Replace the `href="#"` URLs in `Footer` with your real Instagram, Facebook, and LinkedIn profile URLs. Replace `hello@prepx.example` with an email address you control. Update the support link when your 24×7 support channel is ready.

### 6. Terms & Conditions

Edit the sample sections in `TermsModal` inside `src/App.jsx`. The current text is only placeholder copy, not legal advice or a launch-ready policy.

## Suggested next MERN steps

1. Add React Router for pages such as `/get-started`, `/about`, and the dropdown destinations.
2. Build an Express API in a separate `server/` folder.
3. Connect MongoDB for users, practice sessions, and progress.
4. Add authentication and protect user-specific routes.
5. Add server-side Cloudinary upload handling if users will upload files.

This starter is frontend-only; it does not yet include authentication, database access, or an API server.
