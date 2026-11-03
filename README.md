# Custom Starter Screen App

A new-tab page starter screen like momentum, but customized for me: a big clock over a fresh Unsplash photo, with world clocks, weather, a daily quote and nature sounds mixer.

![mymomentum new tab](screenshots/new-tab.png)

## What's on it

- **Clock** in the middle, with world clocks and weather along the top
- **Background photos** from Unsplash, one random photo per request from the collection in `fetch-photos.js`
- **Favorites and thumbs down**: heart a photo to keep it, thumbs-down one to never see it again
- **Quotes** at the bottom, with *next quote* to skip
- **Search** (press `/`) and an optional critter
- **Sounds** (headphones icon): nature sounds and spa music you can layer, each with its own volume slider plus one for everything

![Sound mixer](screenshots/sound-mixer.png)

### Music not included

Two music tiles, **Lake Marie** ("Lake Marie I" by Ian Aisling) and **Porch light** ("Leave the Porch Light On" by Cory Alstad), are from [Uppbeat](https://uppbeat.io/) and aren't in this repo, so they stay silent until you add your own. To use them or add other music, download tracks from [uppbeat.io](https://uppbeat.io/) and save them as `sounds/lakemarie.m4a` and `sounds/porchlight.m4a` (or add new tiles in `index.html`).

## Running it

No build. Open `index.html` in a browser, or set it as your new-tab / home page.

Favorites, hidden photos and settings are saved in the browser. `prefs.js` fills in starting favorites and settings the first time a browser opens the page.

## iPhone / iPad app

The same page, packaged as an app (Capacitor) with every sound stored on the device, so they play with no internet. Photos still come from Unsplash.

One-time setup: install **Xcode** from the Mac App Store and open it once.

To install on your phone or iPad:

1. Plug it into the Mac (on the device, tap **Trust**; on iOS 16+, turn on **Settings → Privacy & Security → Developer Mode**).
2. Run `npm run ios`. It copies the page and sounds into the app and opens Xcode.
3. In Xcode: click **App** in the left sidebar → **Signing & Capabilities** → **Team** → **Add an Account…** and sign in with your Apple ID (free).
4. Pick your device at the top of the window and press **▶ Run**.
5. First launch only: on the device, **Settings → General → VPN & Device Management** → your Apple ID → **Trust**.

With a free Apple ID the app stops opening after 7 days; plug in and press Run again to renew it. Run `npm run ios` again whenever you change the page or add sounds.

In the app, favorites, hidden photos and settings are kept on that device.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page itself |
| `fetch-photos.js` | Unsplash key and the Unsplash collection photos come from (`COLLECTION`); edit it to change what you see |
| `prefs.json` | Starting favorites, blocked photos and settings |
| `prefs-to-js.js` | Copies `prefs.json` into `prefs.js` by hand, after editing `prefs.json` yourself: `node prefs-to-js.js` |
| `build-app.js`, `capacitor.config.json`, `ios/` | The iPhone/iPad app: `npm run ios` builds and opens it in Xcode |
| `sounds/` | Nature sound loops; credits in `sounds/CREDITS.txt` |
