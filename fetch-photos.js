/**
 * fetch-photos.js — gets a background photo from Unsplash.
 * https://unsplash.com/documentation#get-a-random-photo
 */

var UNSPLASH_ACCESS_KEY = "";
var COLLECTION = "Sl1OUepgHLo";   // https://unsplash.com/collections/Sl1OUepgHLo/wallpapers

/* Starting favorites, used only when none are saved yet. */
var FAVORITES = [];

function getRandomPhoto() {
var api = "https://api.unsplash.com/photos/random"
    + "?collections=" + COLLECTION
    + "&orientation=landscape"
    + "&content_filter=high"       
    + "&w=1920" 
    + "&q=85" 
    + "&auto=format";

  console.log("fetching photo from Unsplash: " + api);

  return fetch(api, { headers: { Authorization: "Client-ID " + UNSPLASH_ACCESS_KEY } })
    .then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error("Unsplash " + res.status + ": " + t); });
      return res.json();
    })
    .then(function (p) {
      var name = p.description || p.alt_description || "";
      return {
        id: p.id,
        url: p.urls.raw + "&auto=format&fit=crop&w=3840&q=85",
        thumb: p.urls.small,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        by: p.user.name,
        link: p.links.html
      };
    });
}

/* Photos thumbed down on the page (saved as "sp_blocked"). */
function isBlocked(photo) {
  var saved;
  try { saved = JSON.parse(localStorage.getItem("sp_blocked") || "{}"); } catch (e) { saved = {}; }
  var list = saved.photos || [];
  return list.indexOf(photo.url) !== -1 || list.indexOf(photo.id) !== -1;
}
