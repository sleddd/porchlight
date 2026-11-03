/**
 * build-app.js — copies the page into www/ for the iPhone/iPad app.
 *
 * The app (Capacitor, in ios/) ships everything in www/ inside itself, so
 * the sounds play with no internet. Run `npm run ios` after changing the
 * page; it rebuilds www/, copies it into the Xcode project and opens Xcode.
 */

var fs = require("node:fs");
var path = require("node:path");

var root = __dirname, out = path.join(root, "www");
var FILES = ["index.html", "fetch-photos.js", "prefs.js", "gerald.png", "octavian.png"];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "sounds"), { recursive: true });
FILES.forEach(function (f) { fs.copyFileSync(path.join(root, f), path.join(out, f)); });
fs.readdirSync(path.join(root, "sounds"))
  .filter(function (f) { return /\.(m4a|txt)$/.test(f); })
  .forEach(function (f) { fs.copyFileSync(path.join(root, "sounds", f), path.join(out, "sounds", f)); });
console.log("www/ ready: " + FILES.length + " files + " + fs.readdirSync(path.join(out, "sounds")).length + " in sounds/");
