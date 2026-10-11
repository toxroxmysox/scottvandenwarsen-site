/**
 * Static Mini-Map for Homepage
 * Renders a non-interactive Mercator projection SVG.
 * Gallery countries are highlighted with an accent fill.
 */

(function () {
  'use strict';

  // Shared lookup — see static/js/country-codes.js (loaded first)
  var container = document.getElementById('svw-map-canvas');
  if (!container) return;

  if (!window.SVW || !window.SVW.numericToAlpha2) {
    console.error('mini-map.js: window.SVW.numericToAlpha2 missing (country-codes.js failed to load); map not rendered.');
    container.textContent = 'Map unavailable.';
    return;
  }
  var numericToAlpha2 = window.SVW.numericToAlpha2;

  var width = container.clientWidth;
  var height = Math.min(width * 0.5, 400);

  var projection = d3.geoMercator()
    .scale(width / 6.5)
    .translate([width / 2, height / 1.4]);

  var path = d3.geoPath().projection(projection);

  var svg = d3.select('#svw-map-canvas')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'svw-map-svg');

  var g = svg.append('g');

  function loadJson(url) {
    return d3.json(url).catch(function (err) {
      console.error('mini-map.js: failed to load ' + url, err);
      return null;
    });
  }

  Promise.all([
    loadJson('/data/world-110m.json'),
    loadJson('/galleries.json')
  ]).then(function (results) {
    var worldData = results[0];
    var galleries = Array.isArray(results[1]) ? results[1] : [];

    if (!worldData) {
      container.textContent = 'Map unavailable.';
      return;
    }

    // Build location set
    var locations = {};
    galleries.forEach(function (gal) {
      if (gal.location) locations[gal.location] = true;
    });
    // Mark US as visited if any US-state galleries
    Object.keys(locations).forEach(function (loc) {
      if (loc.startsWith('US-')) locations['US'] = true;
    });

    var countries = topojson.feature(worldData, worldData.objects.countries);

    g.selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', function (d) {
        var alpha2 = numericToAlpha2[String(d.id)];
        var visited = alpha2 && locations[alpha2];
        return 'svw-map__country' + (visited ? ' svw-map__country--visited' : '');
      })
      .attr('d', path);

    // Country borders
    g.append('path')
      .datum(topojson.mesh(worldData, worldData.objects.countries, function (a, b) { return a !== b; }))
      .attr('class', 'svw-map__border')
      .attr('d', path);
  });

})();
