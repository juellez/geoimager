Package.describe({
  summary: "Include NPM Modules Needed to process images loaded via filepicker and simplifies fetching needed GEO data for displaying on a map"
});

Npm.depends({
  "gm":"1.13.1",
  "request":"2.27.0"
});

Package.on_use(function (api) {
  api.add_files("geoimager.js", "server");
});