/**
 * Interactive World Map Gallery
 * Renders a Mercator-projected SVG world map with D3.js.
 * Countries with photo galleries are highlighted and clickable.
 * Clicking zooms in and shows album previews in a sidebar.
 */

(function () {
  'use strict';

  // ISO 3166-1 numeric → alpha-2 lookup
  // Only needs entries for countries that might have galleries.
  // Add new entries here when you create galleries in new countries.
  var numericToAlpha2 = {
    '004': 'AF', '008': 'AL', '012': 'DZ', '020': 'AD', '024': 'AO',
    '028': 'AG', '032': 'AR', '036': 'AU', '040': 'AT', '044': 'BS',
    '048': 'BH', '050': 'BD', '051': 'AM', '052': 'BB', '056': 'BE',
    '060': 'BM', '064': 'BT', '068': 'BO', '070': 'BA', '072': 'BW',
    '076': 'BR', '084': 'BZ', '090': 'SB', '096': 'BN', '100': 'BG',
    '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH', '120': 'CM',
    '124': 'CA', '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL',
    '156': 'CN', '158': 'TW', '170': 'CO', '174': 'KM', '178': 'CG',
    '180': 'CD', '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY',
    '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM', '214': 'DO',
    '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER',
    '233': 'EE', '242': 'FJ', '246': 'FI', '250': 'FR', '262': 'DJ',
    '266': 'GA', '268': 'GE', '270': 'GM', '276': 'DE', '288': 'GH',
    '300': 'GR', '308': 'GD', '320': 'GT', '324': 'GN', '328': 'GY',
    '332': 'HT', '336': 'VA', '340': 'HN', '348': 'HU', '352': 'IS',
    '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE',
    '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM', '392': 'JP',
    '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR',
    '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB', '426': 'LS',
    '428': 'LV', '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT',
    '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV',
    '466': 'ML', '470': 'MT', '478': 'MR', '480': 'MU', '484': 'MX',
    '492': 'MC', '496': 'MN', '498': 'MD', '499': 'ME', '504': 'MA',
    '508': 'MZ', '512': 'OM', '516': 'NA', '524': 'NP', '528': 'NL',
    '540': 'NC', '548': 'VU', '554': 'NZ', '558': 'NI', '562': 'NE',
    '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA', '598': 'PG',
    '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT',
    '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA', '642': 'RO',
    '643': 'RU', '646': 'RW', '659': 'KN', '662': 'LC', '670': 'VC',
    '674': 'SM', '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS',
    '690': 'SC', '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN',
    '705': 'SI', '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES',
    '728': 'SS', '729': 'SD', '732': 'EH', '740': 'SR', '748': 'SZ',
    '752': 'SE', '756': 'CH', '760': 'SY', '762': 'TJ', '764': 'TH',
    '768': 'TG', '776': 'TO', '780': 'TT', '784': 'AE', '788': 'TN',
    '792': 'TR', '795': 'TM', '800': 'UG', '804': 'UA', '807': 'MK',
    '818': 'EG', '826': 'GB', '834': 'TZ', '840': 'US', '854': 'BF',
    '858': 'UY', '860': 'UZ', '862': 'VE', '887': 'YE', '894': 'ZM',
    '-99': 'XK' // Kosovo
  };

  // FIPS → ISO 3166-2 state code lookup
  var fipsToState = {
    '01': 'US-AL', '02': 'US-AK', '04': 'US-AZ', '05': 'US-AR', '06': 'US-CA',
    '08': 'US-CO', '09': 'US-CT', '10': 'US-DE', '11': 'US-DC', '12': 'US-FL',
    '13': 'US-GA', '15': 'US-HI', '16': 'US-ID', '17': 'US-IL', '18': 'US-IN',
    '19': 'US-IA', '20': 'US-KS', '21': 'US-KY', '22': 'US-LA', '23': 'US-ME',
    '24': 'US-MD', '25': 'US-MA', '26': 'US-MI', '27': 'US-MN', '28': 'US-MS',
    '29': 'US-MO', '30': 'US-MT', '31': 'US-NE', '32': 'US-NV', '33': 'US-NH',
    '34': 'US-NJ', '35': 'US-NM', '36': 'US-NY', '37': 'US-NC', '38': 'US-ND',
    '39': 'US-OH', '40': 'US-OK', '41': 'US-OR', '42': 'US-PA', '44': 'US-RI',
    '45': 'US-SC', '46': 'US-SD', '47': 'US-TN', '48': 'US-TX', '49': 'US-UT',
    '50': 'US-VT', '51': 'US-VA', '53': 'US-WA', '54': 'US-WV', '55': 'US-WI',
    '56': 'US-WY', '60': 'US-AS', '66': 'US-GU', '69': 'US-MP', '72': 'US-PR',
    '78': 'US-VI'
  };

  // Viewport breakpoints (must match CSS)
  var MOBILE_MAX = 767;
  var TABLET_MAX = 1023;

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_MAX;
  }

  function isTabletViewport() {
    return window.innerWidth > MOBILE_MAX && window.innerWidth <= TABLET_MAX;
  }

  // State data
  var galleryData = [];
  var galleriesByLocation = {};
  var activeLocation = null;
  var usStatesLoaded = false;
  var usStatesFeatures = null;
  var isZoomedToUS = false;

  // DOM refs
  var mapContainer = document.getElementById('map-container');
  var sidebar = document.getElementById('map-sidebar');
  var sidebarTitle = document.getElementById('sidebar-title');
  var sidebarAlbums = document.getElementById('sidebar-albums');
  var closeBtn = document.getElementById('sidebar-close');

  // D3 setup
  var width, height;
  var svg, g, projection, path, zoom;

  function init() {
    width = mapContainer.clientWidth;
    height = mapContainer.clientHeight;

    projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.6]);

    path = d3.geoPath().projection(projection);

    zoom = d3.zoom()
      .scaleExtent([1, 12])
      .on('zoom', function (event) {
        g.attr('transform', event.transform);
      });

    svg = d3.select('#map-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .on('click', onBackgroundClick);

    svg.call(zoom);

    g = svg.append('g');

    // Load data
    Promise.all([
      d3.json('/data/world-110m.json'),
      d3.json('/galleries.json')
    ]).then(function (results) {
      var worldData = results[0];
      galleryData = results[1];
      buildLocationIndex();
      renderMap(worldData);
    });

    // Event listeners
    closeBtn.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });

    // Resize handler
    window.addEventListener('resize', debounce(onResize, 200));
  }

  function buildLocationIndex() {
    galleriesByLocation = {};
    galleryData.forEach(function (g) {
      if (!g.location) return;
      if (!galleriesByLocation[g.location]) {
        galleriesByLocation[g.location] = [];
      }
      galleriesByLocation[g.location].push(g);
    });
  }

  function renderMap(worldData) {
    var countries = topojson.feature(worldData, worldData.objects.countries);

    g.selectAll('.map-country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', function (d) {
        var alpha2 = numericToAlpha2[String(d.id)];
        var hasGallery = alpha2 && (
          galleriesByLocation[alpha2] ||
          (alpha2 === 'US' && hasUSGalleries())
        );
        return 'map-country' + (hasGallery ? ' has-gallery' : '');
      })
      .attr('d', path)
      .attr('data-id', function (d) { return numericToAlpha2[String(d.id)] || ''; })
      .on('click', function (event, d) {
        event.stopPropagation();
        var alpha2 = numericToAlpha2[String(d.id)];
        if (!alpha2) return;

        if (alpha2 === 'US' && hasUSGalleries()) {
          zoomToFeature(d, false);
          loadUSStates();
          return;
        }

        if (galleriesByLocation[alpha2]) {
          selectLocation(alpha2, d);
        }
      });

    // Country borders (mesh)
    g.append('path')
      .datum(topojson.mesh(worldData, worldData.objects.countries, function (a, b) { return a !== b; }))
      .attr('class', 'map-border')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'rgba(100, 120, 140, 0.25)')
      .style('stroke-width', '0.5px')
      .style('pointer-events', 'none');
  }

  function hasUSGalleries() {
    return Object.keys(galleriesByLocation).some(function (loc) {
      return loc.startsWith('US-');
    });
  }

  function selectLocation(locationCode, feature) {
    // Clear previous active
    d3.selectAll('.map-country.active, .map-state.active').classed('active', false);

    activeLocation = locationCode;

    // Highlight the selected element
    if (feature) {
      d3.selectAll('.map-country[data-id="' + locationCode + '"], .map-state[data-id="' + locationCode + '"]')
        .classed('active', true);
    }

    // Zoom to feature
    if (feature) {
      zoomToFeature(feature);
    }

    // Show sidebar
    showSidebar(locationCode);
  }

  function zoomToFeature(d, showLabel) {
    var bounds = path.bounds(d);
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;

    var availableWidth, availableHeight, tx, ty, scale;

    if (isMobileViewport()) {
      // Mobile: bottom sheet takes ~55% of viewport height.
      // Center the country in the full width, top ~45% of the screen.
      availableWidth = width;
      availableHeight = height * 0.45;
      scale = Math.min(12, 0.6 / Math.max(dx / availableWidth, dy / availableHeight));
      tx = availableWidth / 2 - scale * x;
      ty = availableHeight / 2 - scale * y;
    } else {
      // Tablet & desktop: sidebar panel on the right.
      // Tablet: 40%, Desktop: 33.333%
      var sidebarFraction = isTabletViewport() ? 0.4 : 0.333;
      var sidebarWidth = width * sidebarFraction;
      availableWidth = width - sidebarWidth;
      availableHeight = height;
      scale = Math.min(12, 0.6 / Math.max(dx / availableWidth, dy / availableHeight));
      tx = availableWidth / 2 - scale * x;
      ty = availableHeight / 2 - scale * y;
    }

    svg.transition()
      .duration(750)
      .call(zoom.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      );

    // Show country name label on the map (hidden via CSS on mobile)
    if (showLabel !== false && d.properties && d.properties.name) {
      addCountryLabel(d);
    }
  }

  function addCountryLabel(d) {
    removeCountryLabel();

    // Use an HTML overlay so it's unaffected by SVG zoom transforms
    var label = document.createElement('div');
    label.className = 'country-label';
    label.textContent = d.properties.name.toUpperCase();
    mapContainer.appendChild(label);

    // Position after zoom transition completes
    setTimeout(function () {
      positionCountryLabel(d);
    }, 800);
  }

  function positionCountryLabel(d) {
    var label = mapContainer.querySelector('.country-label');
    if (!label) return;

    // Get the current zoom transform
    var transform = d3.zoomTransform(svg.node());

    // Compute the centroid in projected (SVG) coordinates
    var centroid = path.centroid(d);
    var bounds = path.bounds(d);

    // Apply the zoom transform to get screen coordinates
    var screenX = transform.applyX(centroid[0]);
    var screenTop = transform.applyY(bounds[0][1]);

    // Position the label above the country, centered
    label.style.left = screenX + 'px';
    label.style.top = (screenTop - 30) + 'px';
    label.style.opacity = '1';
  }

  function removeCountryLabel() {
    var existing = mapContainer.querySelector('.country-label');
    if (existing) {
      existing.style.opacity = '0';
      setTimeout(function () { if (existing.parentNode) existing.parentNode.removeChild(existing); }, 200);
    }
  }

  function zoomReset() {
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

  function showSidebar(locationCode) {
    var albums = galleriesByLocation[locationCode] || [];
    if (albums.length === 0) return;

    // Determine display name
    var displayName = locationCode;
    // Try to find a nice name from the data or the map
    var countryEl = d3.select('.map-country[data-id="' + locationCode + '"]');
    if (countryEl.size() > 0) {
      var datum = countryEl.datum();
      if (datum && datum.properties && datum.properties.name) {
        displayName = datum.properties.name;
      }
    }
    // Check for US state name
    var stateEl = d3.select('.map-state[data-id="' + locationCode + '"]');
    if (stateEl.size() > 0) {
      var stateDatum = stateEl.datum();
      if (stateDatum && stateDatum.properties && stateDatum.properties.name) {
        displayName = stateDatum.properties.name;
      }
    }

    sidebarTitle.textContent = displayName;

    // Build album cards
    sidebarAlbums.innerHTML = '';
    albums.forEach(function (album) {
      var card = document.createElement('a');
      card.href = album.url;
      card.className = 'sidebar-album-card';

      var img = document.createElement('img');
      img.src = album.cover;
      img.alt = album.title;
      img.className = 'sidebar-album-cover';
      img.loading = 'lazy';
      card.appendChild(img);

      var info = document.createElement('div');
      info.className = 'sidebar-album-info';

      var title = document.createElement('span');
      title.className = 'sidebar-album-title';
      title.textContent = album.title;
      info.appendChild(title);

      var date = document.createElement('span');
      date.className = 'sidebar-album-date';
      date.textContent = formatDate(album.date);
      info.appendChild(date);

      if (album.summary) {
        var summary = document.createElement('span');
        summary.className = 'sidebar-album-summary';
        summary.textContent = album.summary;
        info.appendChild(summary);
      }

      card.appendChild(info);
      sidebarAlbums.appendChild(card);
    });

    sidebar.classList.add('open');

    // On mobile, disable D3 zoom while bottom sheet is open.
    // Prevents touch events on the map behind the sheet from
    // being captured as pan/zoom gestures.
    if (isMobileViewport()) {
      svg.on('.zoom', null);
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('open');

    // Re-enable D3 zoom (disabled when mobile sidebar opened)
    svg.call(zoom);
    d3.selectAll('.map-country.active, .map-state.active').classed('active', false);
    activeLocation = null;

    // Remove country label
    removeCountryLabel();

    // Remove US states if zoomed in
    if (isZoomedToUS) {
      g.selectAll('.map-state').remove();
      isZoomedToUS = false;
    }

    zoomReset();
  }

  function onBackgroundClick(event) {
    // Only close if clicking the SVG background (not a country)
    if (event.target === svg.node()) {
      closeSidebar();
    }
  }

  // --- US State Support ---

  function loadUSStates() {
    if (usStatesLoaded && usStatesFeatures) {
      renderUSStates();
      return;
    }

    d3.json('/data/us-states-10m.json').then(function (usData) {
      usStatesFeatures = topojson.feature(usData, usData.objects.states);
      usStatesLoaded = true;
      renderUSStates();
    });
  }

  function renderUSStates() {
    isZoomedToUS = true;

    // Remove existing state paths
    g.selectAll('.map-state').remove();

    g.selectAll('.map-state')
      .data(usStatesFeatures.features)
      .enter()
      .append('path')
      .attr('class', function (d) {
        var stateCode = fipsToState[d.id];
        var hasGallery = stateCode && galleriesByLocation[stateCode];
        return 'map-state' + (hasGallery ? ' has-gallery' : '');
      })
      .attr('d', path)
      .attr('data-id', function (d) { return fipsToState[d.id] || ''; })
      .on('click', function (event, d) {
        event.stopPropagation();
        var stateCode = fipsToState[d.id];
        if (stateCode && galleriesByLocation[stateCode]) {
          selectLocation(stateCode, d);
        }
      });

    // If there are US-level (non-state) galleries, show sidebar with those
    if (galleriesByLocation['US']) {
      showSidebar('US');
    }
  }

  // --- Utilities ---

  function formatDate(dateStr) {
    var parts = dateStr.split('-');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function onResize() {
    width = mapContainer.clientWidth;
    height = mapContainer.clientHeight;

    projection
      .scale(width / 6.5)
      .translate([width / 2, height / 1.6]);

    svg.attr('width', width).attr('height', height);
    g.selectAll('path').attr('d', path);

    // If sidebar is open, close it on major resize (e.g. orientation change)
    // to prevent stale zoom positioning
    if (activeLocation && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  }

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
