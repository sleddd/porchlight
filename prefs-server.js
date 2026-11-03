/**
 * prefs-server.js — lets the page read and write prefs.json, no file picker.
 *
 * Browsers can't save files from a page without asking you to pick one, so
 * this tiny helper does it for them. index.html talks to it at
 * http://127.0.0.1:47321/prefs:
 *   GET  -> the contents of prefs.json
 *   POST -> replaces prefs.json (and regenerates prefs.js, so every
 *           browser's next tab starts from the same favorites)
 *
 * Only reachable from this Mac (127.0.0.1), and only pages opened from disk
 * (file://, which browsers label origin "null") may write; websites can't.
 *
 * Start it at login (macOS LaunchAgent com.mymomentum.prefs), or by hand:
 *   node prefs-server.js
 */

var http = require("node:http");
var fs = require("node:fs");
var path = require("node:path");

var PORT = 47321;
var JSON_FILE = path.join(__dirname, "prefs.json");
var JS_FILE = path.join(__dirname, "prefs.js");
var MAX_BYTES = 5 * 1024 * 1024;

function writeAtomic(file, text) {
  var tmp = file + ".tmp";
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

function save(prefs) {
  writeAtomic(JSON_FILE, JSON.stringify(prefs, null, 2) + "\n");
  writeAtomic(JS_FILE,
    "/* Generated from prefs.json by prefs-server.js. Don't edit; edit prefs.json. */\n" +
    "window.PREFS = " + JSON.stringify(prefs, null, 2) + ";\n");
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Private-Network": "true"
  });
  res.end(body);
}

http.createServer(function (req, res) {
  if (req.url.split("?")[0] !== "/prefs") return send(res, 404, '{"error":"not found"}');
  if (req.method === "OPTIONS") return send(res, 204, "");

  if (req.method === "GET") {
    var text;
    try { text = fs.readFileSync(JSON_FILE, "utf8"); } catch (e) { text = "{}"; }
    try { JSON.parse(text || "{}"); } catch (e) {
      // half-edited by hand: refuse, so the page never overwrites it
      return send(res, 500, '{"error":"prefs.json is not valid JSON"}');
    }
    return send(res, 200, text.trim() ? text : "{}");
  }

  if (req.method === "POST") {
    var origin = req.headers.origin;
    if (origin && origin !== "null") return send(res, 403, '{"error":"only the local page may write"}');
    var chunks = [], size = 0;
    req.on("data", function (c) {
      size += c.length;
      if (size > MAX_BYTES) { send(res, 413, '{"error":"too large"}'); req.destroy(); }
      else chunks.push(c);
    });
    req.on("end", function () {
      if (res.writableEnded) return;
      var prefs;
      try { prefs = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) {
        return send(res, 400, '{"error":"bad JSON"}');
      }
      if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) {
        return send(res, 400, '{"error":"expected an object"}');
      }
      try { save(prefs); } catch (e) { return send(res, 500, JSON.stringify({ error: e.message })); }
      send(res, 200, '{"ok":true}');
    });
    return;
  }

  send(res, 405, '{"error":"method not allowed"}');
}).listen(PORT, "127.0.0.1", function () {
  console.log("prefs-server: http://127.0.0.1:" + PORT + "/prefs -> " + JSON_FILE);
});
