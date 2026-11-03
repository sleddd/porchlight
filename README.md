# Custom Starter Screen App

A new-tab page starter screen like momentum, but customized for me: a big clock over a fresh Unsplash photo, with world clocks, weather, a daily quote and nature sounds mixer.

![mymomentum new tab](screenshots/new-tab.png)

## What's on it

- **Clock** in the middle, with world clocks and weather along the top
- **Background photos** from Unsplash, picked from the topics in `fetch-photos.js` (seasonal topics show up in their season)
- **Favorites and thumbs down**: heart a photo to keep it, thumbs-down one to never see it again
- **Quotes** at the bottom, with *next quote* to skip
- **Search** (press `/`) and an optional critter
- **Sounds** (headphones icon): nature sounds and spa music you can layer, each with its own volume slider plus one for everything

![Sound mixer](screenshots/sound-mixer.png)

## Running it

No build. Open `index.html` in a browser, or set it as your new-tab / home page.

To save favorites, hidden photos and settings to `prefs.json` (shared by every browser), keep the small helper `prefs-server.js` running. Start it at login once with:

```sh
cat > ~/Library/LaunchAgents/com.mymomentum.prefs.plist <<'EOF2'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.mymomentum.prefs</string>
  <key>ProgramArguments</key><array>
    <string>/opt/homebrew/bin/node</string>
    <string>/Users/fastandcurious/Documents/mymomentum/prefs-server.js</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>/tmp/com.mymomentum.prefs.log</string>
</dict></plist>
EOF2
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.mymomentum.prefs.plist
```

Without it the page still works; changes stay in that browser and are saved to `prefs.json` as soon as the helper is running.

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

In the app, favorites, hidden photos and settings are kept on that device (the `prefs.json` helper only runs on the Mac).

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page itself |
| `fetch-photos.js` | Unsplash key and the list of photo topics; edit it to change what you see |
| `prefs.json` | Favorites, blocked photos and settings |
| `prefs-server.js` | Helper that saves `prefs.json` for the page (and refreshes `prefs.js`), no file picker |
| `prefs-to-js.js` | Copies `prefs.json` into `prefs.js` by hand, after editing `prefs.json` yourself: `node prefs-to-js.js` |
| `build-app.js`, `capacitor.config.json`, `ios/` | The iPhone/iPad app: `npm run ios` builds and opens it in Xcode |
| `sounds/` | Nature sound loops; credits in `sounds/CREDITS.txt` |
