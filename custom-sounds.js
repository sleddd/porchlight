/**
 * custom-sounds.js — lists your own sounds in sounds/custom/ for the page.
 *
 * Put audio files (mp3, m4a, wav, aac, ogg) in sounds/custom/ and run:
 *
 *     node custom-sounds.js
 *
 * It writes sounds/custom/custom-sounds.js, which the page loads to add a tile
 * for each file. The whole sounds/custom/ folder is in .gitignore, so neither
 * the files nor that list ever go into the repo.
 *
 * Run it again after adding or removing files. Entries already in the list
 * are kept as they are, so you can edit them by hand:
 *   label   the name on the tile
 *   group   "music" for spa music (plays one track at a time from Up next),
 *           "nature" for a sound you layer
 *   cat     the music filter it shows under (default "My music")
 *   artist  shown under the track in Up next
 *   hidden  true to leave a file out of the page without deleting it
 *   icon    a name from ICON in index.html (rain, wind, fire, ocean, river,
 *           waterfall, bird, moon, frost, chimes, bowl, piano, guitar, note ...)
 * New files get a guess: Uppbeat downloads ("...-main-version-...") are music,
 * everything else is a nature sound. Titles and artists come from the file's
 * tags when it has them.
 */

var fs = require("node:fs");
var path = require("node:path");

var DIR = path.join(__dirname, "sounds", "custom");
var OUT = path.join(DIR, "custom-sounds.js");
var AUDIO = /\.(mp3|m4a|aac|wav|ogg|oga|flac)$/i;

if(!fs.existsSync(DIR)){ console.log("No sounds/custom/ folder: nothing to do."); process.exit(0); }

// title / artist from ID3v2 tags (mp3), when present
function tags(file){
  var out = {}, b;
  try{ b = fs.readFileSync(file); }catch(e){ return out; }
  if(b.length < 10 || b.toString("latin1", 0, 3) !== "ID3") return out;
  var v = b[3], size = (b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9], p = 10;
  while(p + 10 < 10 + size && p + 10 < b.length){
    var id = b.toString("latin1", p, p + 4);
    if(!/^[A-Z0-9]{4}$/.test(id)) break;
    var n = v === 4 ? ((b[p + 4] << 21) | (b[p + 5] << 14) | (b[p + 6] << 7) | b[p + 7]) : b.readUInt32BE(p + 4);
    if(id === "TIT2" || id === "TPE1"){
      var d = b.slice(p + 10, p + 10 + n), enc = d[0];
      var s = enc === 1 || enc === 2 ? d.slice(1).toString("utf16le").replace(/^﻿/, "") : d.slice(1).toString(enc === 3 ? "utf8" : "latin1");
      out[id === "TIT2" ? "title" : "artist"] = s.replace(/\0/g, "").trim();
    }
    p += 10 + n;
  }
  return out;
}

var ICONS = [
  [/thunder|storm/, "thunder"], [/rain/, "rain"], [/chime/, "chimes"], [/fire/, "fire"],
  [/waterfall/, "waterfall"], [/ocean|beach|coast|wave|sea/, "ocean"], [/lake/, "lake"],
  [/stream|river|brook|water|creek/, "river"], [/owl|loon|bird|gull/, "bird"],
  [/cicada|cricket|insect|night/, "moon"], [/snow|winter|frost|ice/, "frost"], [/wind|breeze/, "wind"],
  [/forest|wood|tree|countryside|meadow/, "trees"], [/mountain/, "mountain"],
  [/temple|gong|bowl/, "bowl"], [/drone|space|ethereal/, "space"], [/piano/, "piano"], [/guitar/, "guitar"]
];
function guess(file){
  var stem = file.replace(AUDIO, ""), t = tags(path.join(DIR, file));
  var music = /-main-version-/.test(stem);
  var words = stem.replace(/-main-version-.*$/, "").replace(/-\d[\d-]*$/, "").replace(/[-_]+/g, " ").trim();
  var title = t.title || words.charAt(0).toUpperCase() + words.slice(1);
  if(music) title = title.replace(/\s*\((feat|ft)\.?[^)]*\)\s*$/i, "");
  else title = title.split(" - ")[0].replace(/\s+ambience\b/i, "").trim();
  var hay = (stem + " " + (t.title || "")).toLowerCase(), icon = music ? "note" : "wave";
  for(var i = 0; i < ICONS.length; i++) if(ICONS[i][0].test(hay)){ icon = ICONS[i][1]; break; }
  var e = {
    id: stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48),
    file: file, label: title, group: music ? "music" : "nature", icon: icon
  };
  if(music){ e.cat = "My music"; if(t.artist) e.artist = t.artist; }
  return e;
}

// what the list says now, so hand edits survive
var old = [];
if(fs.existsSync(OUT)){
  var src = fs.readFileSync(OUT, "utf8");
  try{ old = JSON.parse(src.slice(src.indexOf("["), src.lastIndexOf("]") + 1)); }
  catch(e){ console.error("Couldn't read " + OUT + " (" + e.message + "); fix or delete it and run again."); process.exit(1); }
}
var byFile = {};
old.forEach(function(e){ if(e && e.file) byFile[e.file] = e; });

var files = fs.readdirSync(DIR).filter(function(f){ return AUDIO.test(f); }).sort();
var added = 0, ids = {};
var list = files.map(function(f){
  var e = byFile[f];
  if(!e){ e = guess(f); added++; }
  // ids must be unique
  var id = e.id, n = 2;
  while(ids[id]) id = e.id + "-" + n++;
  e.id = id; ids[id] = true;
  return e;
});
list.sort(function(a, b){ return (a.group === b.group ? 0 : a.group === "music" ? 1 : -1) || a.label.localeCompare(b.label); });

fs.writeFileSync(OUT,
  "/* Your own sounds in this folder, for the page. Made by `node custom-sounds.js`;\n" +
  "   edit labels, groups and icons here (see that script). Not in git. */\n" +
  "window.CUSTOM_SOUNDS = [\n" + list.map(function(e){ return "  " + JSON.stringify(e); }).join(",\n") + "\n];\n");
console.log("sounds/custom/custom-sounds.js: " + list.length + " sounds (" + added + " new, " +
            (old.length - (list.length - added)) + " removed).");
