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
// your Unsplash key, kept out of git
if (fs.existsSync(path.join(root, "unsplash-key.js"))) fs.copyFileSync(path.join(root, "unsplash-key.js"), path.join(out, "unsplash-key.js"));
fs.readdirSync(path.join(root, "sounds"))
  .filter(function (f) { return /\.(m4a|txt)$/.test(f); })
  .forEach(function (f) { fs.copyFileSync(path.join(root, "sounds", f), path.join(out, "sounds", f)); });

// Your own sounds (sounds/custom/, kept out of git) go on the device too.
// The app gets them as AAC .m4a, like the built-in sounds: MP3s played a few
// seconds on iPad and then stopped. Conversions (macOS afconvert) are kept in
// sounds/custom/.app-cache/ so later builds only convert new files.
var cp = require("node:child_process");
var custom = path.join(root, "sounds", "custom"), cache = path.join(custom, ".app-cache");
var customN = 0, converted = 0, renamed = {};
if (fs.existsSync(custom)) {
  var dest = path.join(out, "sounds", "custom");
  fs.mkdirSync(dest);
  fs.readdirSync(custom).filter(function (f) { return /\.(mp3|m4a|aac|wav|ogg|oga|flac)$/i.test(f); }).forEach(function (f) {
    var src = path.join(custom, f);
    customN++;
    if (/\.m4a$/i.test(f)) return fs.copyFileSync(src, path.join(dest, f));
    var m4a = f.replace(/\.[^.]+$/, ".m4a"), cached = path.join(cache, m4a);
    try {
      if (!fs.existsSync(cached) || fs.statSync(cached).mtimeMs < fs.statSync(src).mtimeMs) {
        fs.mkdirSync(cache, { recursive: true });
        cp.execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "192000", src, cached]);
        converted++;
      }
      fs.copyFileSync(cached, path.join(dest, m4a));
      renamed[f] = m4a;
    } catch (e) {
      console.warn("couldn't convert " + f + " (" + e.message.split("\n")[0] + "); copying it as is");
      fs.copyFileSync(src, path.join(dest, f));
    }
  });
  // the list the page reads, pointing at the converted files
  var list = path.join(custom, "custom-sounds.js");
  if (fs.existsSync(list)) {
    var js = fs.readFileSync(list, "utf8");
    Object.keys(renamed).forEach(function (f) { js = js.split(JSON.stringify(f)).join(JSON.stringify(renamed[f])); });
    fs.writeFileSync(path.join(dest, "custom-sounds.js"), js);
  }
}
if (customN) console.log("sounds/custom: " + customN + " sounds, " + Object.keys(renamed).length + " as .m4a (" + converted +
                         " converted now; run `node custom-sounds.js` first if you added any)");
console.log("www/ ready: " + FILES.length + " files + " + fs.readdirSync(path.join(out, "sounds")).length + " in sounds/");
