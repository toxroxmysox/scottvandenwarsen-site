/**
 * Travel Page — Interactive Map + Timeline + Flight Lines
 * Renders a Mercator-projected SVG world map with D3.js.
 * Countries with trips are highlighted and clickable.
 * A horizontal timeline syncs with the map via shared state.
 */

(function () {
  'use strict';

  // ===================================================================
  // STATE MANAGEMENT
  // ===================================================================

  var state = {
    activeTripId: null,
    _listeners: [],
    subscribe: function (fn) {
      this._listeners.push(fn);
    },
    setActiveTrip: function (tripId) {
      var prev = this.activeTripId;
      if (tripId === prev) return; // no-op if already active
      this.activeTripId = tripId;
      for (var i = 0; i < this._listeners.length; i++) {
        this._listeners[i](tripId, prev);
      }
    }
  };

  // ===================================================================
  // LOOKUP TABLES
  // ===================================================================

  // ISO 3166-1 numeric → alpha-2
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
    '-99': 'XK'
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

  // ===================================================================
  // DATA
  // ===================================================================

  var MOBILE_MAX = 767;
  var TABLET_MAX = 1023;

  var trips = [];
  var tripsById = {};
  var tripsByCountry = {};  // alpha2 → trip (most recent)
  var galleryData = [];
  var galleriesByLocation = {};
  var galleriesByUrl = {};   // gallery url → gallery object
  var countryCoords = {};    // alpha2 → [lon, lat]

  var activeLocation = null;
  var usStatesLoaded = false;
  var usStatesFeatures = null;
  var isZoomedToUS = false;

  // DOM refs
  var mapContainer = document.getElementById('map-container');
  var sidebar = document.getElementById('map-sidebar');
  var sidebarBody = document.getElementById('sidebar-body');
  var sidebarTitle = document.getElementById('sidebar-title');
  var sidebarAlbums = document.getElementById('sidebar-albums');
  var closeBtn = document.getElementById('sidebar-close');
  var timelineEl = document.getElementById('travel-timeline');
  var tabsEl = document.getElementById('travel-tabs');
  var tabMapEl = document.getElementById('tab-map');
  var tabTimelineEl = document.getElementById('tab-timeline');
  var timelineCardsEl = document.getElementById('timeline-cards');

  // Sheet drag state (mobile only)
  var sheetDragStartY = 0;
  var sheetDragDelta = 0;
  var sheetIsDragging = false;

  // D3 setup
  var width, height;
  var svg, g, projection, path, zoom;

  // ===================================================================
  // VIEWPORT HELPERS
  // ===================================================================

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_MAX;
  }

  function isTabletViewport() {
    return window.innerWidth > MOBILE_MAX && window.innerWidth <= TABLET_MAX;
  }

  // ===================================================================
  // INIT
  // ===================================================================

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

    // Load all data in parallel
    Promise.all([
      d3.json('/data/world-110m.json'),
      d3.json('/galleries.json'),
      d3.json('/trips.json')
    ]).then(function (results) {
      var worldData = results[0];
      galleryData = results[1];
      trips = results[2];
      buildIndexes();
      renderMap(worldData);
      // renderFlightLines(); // disabled — will fix later
      renderTimeline();
      renderTimelineCards();
    });

    // Event listeners
    setupTabs();
    closeBtn.addEventListener('click', function () {
      state.setActiveTrip(null);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') state.setActiveTrip(null);
    });

    // Resize handler
    window.addEventListener('resize', debounce(onResize, 200));

    // Subscribe to state changes
    state.subscribe(onActiveTripChange);
  }

  // ===================================================================
  // DATA INDEXES
  // ===================================================================

  function buildIndexes() {
    // Gallery index by location (existing behavior)
    galleriesByLocation = {};
    galleryData.forEach(function (g) {
      if (!g.location) return;
      if (!galleriesByLocation[g.location]) {
        galleriesByLocation[g.location] = [];
      }
      galleriesByLocation[g.location].push(g);
    });

    // Gallery index by URL
    galleriesByUrl = {};
    galleryData.forEach(function (g) {
      if (g.url) galleriesByUrl[g.url] = g;
    });

    // Trip indexes
    tripsById = {};
    tripsByCountry = {};
    // Sort trips chronologically
    trips.sort(function (a, b) {
      return a.trip_start < b.trip_start ? -1 : 1;
    });
    trips.forEach(function (t) {
      tripsById[t.id] = t;
      // Attach gallery data if available
      if (t.gallery && galleriesByUrl[t.gallery]) {
        t._gallery = galleriesByUrl[t.gallery];
      }
      // Index by country — store most recent trip per country
      t.country_codes.forEach(function (code) {
        tripsByCountry[code] = t;
      });
    });
  }

  // ===================================================================
  // STATE CHANGE HANDLER
  // ===================================================================

  function onActiveTripChange(tripId, prevTripId) {
    if (tripId) {
      var trip = tripsById[tripId];
      if (!trip) return;

      // Highlight countries on map
      d3.selectAll('.map-country.active, .map-state.active').classed('active', false);
      trip.country_codes.forEach(function (code) {
        d3.selectAll('.map-country[data-id="' + code + '"], .map-state[data-id="' + code + '"]')
          .classed('active', true);
      });
      activeLocation = trip.country_codes[0];

      // Zoom to first country
      var countryEl = d3.select('.map-country[data-id="' + trip.country_codes[0] + '"]');
      if (countryEl.size() > 0) {
        zoomToFeature(countryEl.datum());
      }

      // Show sidebar with trip info
      showTripSidebar(trip);

      // Highlight timeline
      highlightTimelineNode(tripId);

    } else {
      // Deselect
      d3.selectAll('.map-country.active, .map-state.active').classed('active', false);
      activeLocation = null;
      closeSidebar();
      removeCountryLabel();
      highlightTimelineNode(null);

      if (isZoomedToUS) {
        g.selectAll('.map-state').remove();
        isZoomedToUS = false;
      }

      zoomReset();
    }
  }

  // ===================================================================
  // MAP RENDERING
  // ===================================================================

  // Split overseas territories from their parent country so they don't
  // highlight when the European mainland is selected.
  // Currently handles: France (removes French Guiana — lon < -10°).
  function splitOverseasTerritories(features) {
    var result = [];
    var overseas = [];

    features.forEach(function (f) {
      var alpha2 = numericToAlpha2[String(f.id)];

      if (alpha2 === 'FR' && f.geometry.type === 'MultiPolygon') {
        var mainPolygons = [];
        f.geometry.coordinates.forEach(function (poly) {
          // Check centroid longitude of the exterior ring
          var ring = poly[0];
          var avgLon = ring.reduce(function (s, c) { return s + c[0]; }, 0) / ring.length;
          if (avgLon < -10) {
            // Overseas territory — render separately without highlights
            overseas.push({
              type: 'Feature',
              id: f.id,
              properties: f.properties,
              geometry: { type: 'Polygon', coordinates: poly }
            });
          } else {
            mainPolygons.push(poly);
          }
        });
        // Rebuild France with only mainland + Corsica
        var mainFrance = {
          type: 'Feature',
          id: f.id,
          properties: f.properties,
          geometry: { type: 'MultiPolygon', coordinates: mainPolygons }
        };
        result.push(mainFrance);
      } else {
        result.push(f);
      }
    });

    return { main: result, overseas: overseas };
  }

  function renderMap(worldData) {
    var countries = topojson.feature(worldData, worldData.objects.countries);

    // Compute country centroids from GeoJSON for flight lines
    // (auto-updates when new countries appear in trips — no static file needed)
    countryCoords = {};
    countries.features.forEach(function (feature) {
      var alpha2 = numericToAlpha2[String(feature.id)];
      if (alpha2) {
        countryCoords[alpha2] = d3.geoCentroid(feature);
      }
    });
    // Small territories omitted from 110m TopoJSON — manual [lon, lat]
    var smallTerritoryCoords = {
      'PF': [-149.57, -17.53],  // French Polynesia (Tahiti)
      'MV': [73.22, 3.20],      // Maldives
      'SC': [55.49, -4.68],     // Seychelles
      'MU': [57.55, -20.35]     // Mauritius
    };
    Object.keys(smallTerritoryCoords).forEach(function (code) {
      if (!countryCoords[code]) {
        countryCoords[code] = smallTerritoryCoords[code];
      }
    });

    var split = splitOverseasTerritories(countries.features);

    // Render overseas territories (no highlights, no click, no data-id)
    if (split.overseas.length > 0) {
      g.selectAll('.map-overseas')
        .data(split.overseas)
        .enter()
        .append('path')
        .attr('class', 'map-country map-overseas')
        .attr('d', path);
    }

    g.selectAll('.map-country-main')
      .data(split.main)
      .enter()
      .append('path')
      .attr('class', function (d) {
        var alpha2 = numericToAlpha2[String(d.id)];
        var hasContent = alpha2 && (
          galleriesByLocation[alpha2] ||
          tripsByCountry[alpha2] ||
          (alpha2 === 'US' && hasUSGalleries())
        );
        return 'map-country' + (hasContent ? ' has-gallery' : '');
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

        // Check for trip first, then gallery
        if (tripsByCountry[alpha2]) {
          state.setActiveTrip(tripsByCountry[alpha2].id);
        } else if (galleriesByLocation[alpha2]) {
          // Legacy: country with gallery but no trip entry
          selectLocationLegacy(alpha2, d);
        }
      });

    // Country borders
    g.append('path')
      .datum(topojson.mesh(worldData, worldData.objects.countries, function (a, b) { return a !== b; }))
      .attr('class', 'map-border')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'var(--color-ink)')
      .style('stroke-opacity', '0.15')
      .style('stroke-width', '0.5px')
      .style('pointer-events', 'none');
  }

  function hasUSGalleries() {
    return Object.keys(galleriesByLocation).some(function (loc) {
      return loc.startsWith('US-');
    });
  }

  // Legacy sidebar for countries with galleries but no trip entry
  function selectLocationLegacy(locationCode, feature) {
    d3.selectAll('.map-country.active, .map-state.active').classed('active', false);
    activeLocation = locationCode;

    if (feature) {
      d3.selectAll('.map-country[data-id="' + locationCode + '"]').classed('active', true);
      zoomToFeature(feature);
    }

    showLegacySidebar(locationCode);
  }

  // ===================================================================
  // ZOOM
  // ===================================================================

  function zoomToFeature(d, showLabel) {
    var bounds = path.bounds(d);
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;

    var availableWidth, availableHeight, tx, ty, scale;

    if (isMobileViewport()) {
      availableWidth = width;
      availableHeight = height * 0.45;
      scale = Math.min(12, 0.6 / Math.max(dx / availableWidth, dy / availableHeight));
      tx = availableWidth / 2 - scale * x;
      ty = availableHeight / 2 - scale * y;
    } else {
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

    if (showLabel !== false && d.properties && d.properties.name) {
      addCountryLabel(d);
    }
  }

  function zoomReset() {
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

  // ===================================================================
  // COUNTRY LABEL
  // ===================================================================

  function addCountryLabel(d) {
    removeCountryLabel();

    var label = document.createElement('div');
    label.className = 'country-label';
    label.textContent = d.properties.name.toUpperCase();

    // Center label in the visible map area (excluding sidebar)
    if (isMobileViewport()) {
      label.style.left = (width / 2) + 'px';
    } else {
      var sidebarFraction = isTabletViewport() ? 0.4 : 0.333;
      var visibleWidth = width * (1 - sidebarFraction);
      label.style.left = (visibleWidth / 2) + 'px';
    }

    mapContainer.appendChild(label);

    // Fade in after zoom animation completes
    setTimeout(function () {
      if (label.parentNode) label.style.opacity = '1';
    }, 800);
  }

  function removeCountryLabel() {
    var existing = mapContainer.querySelector('.country-label');
    if (existing) {
      existing.style.opacity = '0';
      setTimeout(function () { if (existing.parentNode) existing.parentNode.removeChild(existing); }, 200);
    }
  }

  // ===================================================================
  // SIDEBAR — TRIP VIEW
  // ===================================================================

  function showTripSidebar(trip) {
    sidebarAlbums.innerHTML = '';

    // Title
    sidebarTitle.textContent = trip.title;

    // Date range
    var dates = document.createElement('div');
    dates.className = 'sidebar-trip-dates';
    dates.textContent = formatDateRange(trip.trip_start, trip.trip_end);
    sidebarAlbums.appendChild(dates);

    // Description
    if (trip.description) {
      var desc = document.createElement('p');
      desc.className = 'sidebar-trip-description';
      desc.textContent = trip.description;
      sidebarAlbums.appendChild(desc);
    }

    // Gallery card (if exists)
    if (trip._gallery) {
      var album = trip._gallery;
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

      var albumTitle = document.createElement('span');
      albumTitle.className = 'sidebar-album-title';
      albumTitle.textContent = 'View Gallery →';
      info.appendChild(albumTitle);

      if (album.summary) {
        var summary = document.createElement('span');
        summary.className = 'sidebar-album-summary';
        summary.textContent = album.summary;
        info.appendChild(summary);
      }

      card.appendChild(info);
      sidebarAlbums.appendChild(card);
    }

    // Prev/Next navigation
    var tripIndex = trips.indexOf(trip);
    var nav = document.createElement('div');
    nav.className = 'sidebar-trip-nav';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'sidebar-trip-nav-btn';
    prevBtn.type = 'button';
    if (tripIndex > 0) {
      prevBtn.textContent = '← ' + trips[tripIndex - 1].title;
      prevBtn.addEventListener('click', function () {
        state.setActiveTrip(trips[tripIndex - 1].id);
      });
    } else {
      prevBtn.textContent = '';
      prevBtn.disabled = true;
    }
    nav.appendChild(prevBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'sidebar-trip-nav-btn';
    nextBtn.type = 'button';
    if (tripIndex < trips.length - 1) {
      nextBtn.textContent = trips[tripIndex + 1].title + ' →';
      nextBtn.addEventListener('click', function () {
        state.setActiveTrip(trips[tripIndex + 1].id);
      });
    } else {
      nextBtn.textContent = '';
      nextBtn.disabled = true;
    }
    nav.appendChild(nextBtn);

    sidebarAlbums.appendChild(nav);

    sidebar.classList.add('open');

    if (isMobileViewport()) {
      setupSheetHandle();
    }
  }

  // Legacy sidebar for gallery-only locations (no trip entry)
  function showLegacySidebar(locationCode) {
    var albums = galleriesByLocation[locationCode] || [];
    if (albums.length === 0) return;

    var displayName = locationCode;
    var countryEl = d3.select('.map-country[data-id="' + locationCode + '"]');
    if (countryEl.size() > 0) {
      var datum = countryEl.datum();
      if (datum && datum.properties && datum.properties.name) {
        displayName = datum.properties.name;
      }
    }

    sidebarTitle.textContent = displayName;
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

    if (isMobileViewport()) {
      setupSheetHandle();
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebar.classList.remove('expanded');
    sidebar.style.transform = '';
    d3.selectAll('.map-country.active, .map-state.active').classed('active', false);
    activeLocation = null;
  }

  // ===================================================================
  // MOBILE SHEET HANDLE
  // ===================================================================

  function setupSheetHandle() {
    var existing = sidebar.querySelector('.sheet-handle');
    if (existing) existing.parentNode.removeChild(existing);

    var handle = document.createElement('div');
    handle.className = 'sheet-handle';
    var bar = document.createElement('div');
    bar.className = 'sheet-handle-bar';
    handle.appendChild(bar);

    sidebar.insertBefore(handle, sidebarBody);

    handle.addEventListener('touchstart', function (e) {
      sheetDragStartY = e.touches[0].clientY;
      sheetDragDelta = 0;
      sheetIsDragging = true;
      sidebar.classList.add('dragging');
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    handle.addEventListener('touchmove', function (e) {
      if (!sheetIsDragging) return;
      var deltaY = e.touches[0].clientY - sheetDragStartY;
      sheetDragDelta = deltaY;

      if (deltaY > 0) {
        sidebar.style.transform = 'translateY(' + deltaY + 'px)';
        sidebar.style.maxHeight = '';
      } else {
        sidebar.style.transform = '';
        var baseH = window.innerHeight * 0.55;
        var maxH = window.innerHeight * 0.82;
        sidebar.style.maxHeight = Math.min(baseH + Math.abs(deltaY), maxH) + 'px';
      }
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    handle.addEventListener('touchend', function (e) {
      if (!sheetIsDragging) return;
      sheetIsDragging = false;
      sidebar.classList.remove('dragging');
      sidebar.style.transform = '';
      sidebar.style.maxHeight = '';

      if (sheetDragDelta > 80) {
        state.setActiveTrip(null);
      } else if (sheetDragDelta < -40) {
        sidebar.classList.add('expanded');
      }
      e.stopPropagation();
    }, { passive: true });
  }

  // ===================================================================
  // BACKGROUND CLICK
  // ===================================================================

  function onBackgroundClick(event) {
    if (event.target === svg.node()) {
      state.setActiveTrip(null);
    }
  }

  // ===================================================================
  // US STATES
  // ===================================================================

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
          selectLocationLegacy(stateCode, d);
        }
      });

    if (galleriesByLocation['US']) {
      showLegacySidebar('US');
    }
  }

  // ===================================================================
  // TIMELINE
  // ===================================================================

  function renderTimeline() {
    if (!timelineEl) return;
    timelineEl.innerHTML = '';

    var track = document.createElement('div');
    track.className = 'timeline-track';

    var now = new Date();

    trips.forEach(function (trip, i) {
      var tripDate = new Date(trip.trip_start);
      var isFuture = tripDate > now;

      // Connector before each node (except the first)
      if (i > 0) {
        var connector = document.createElement('div');
        connector.className = 'timeline-connector';
        if (isFuture) {
          connector.classList.add('future');
        }
        track.appendChild(connector);
      }

      var node = document.createElement('div');
      node.className = 'timeline-node';
      node.setAttribute('data-trip-id', trip.id);
      if (isFuture) {
        node.classList.add('future');
      }

      var dot = document.createElement('div');
      dot.className = 'timeline-dot';
      node.appendChild(dot);

      var label = document.createElement('span');
      label.className = 'timeline-label';
      label.textContent = trip.title;
      node.appendChild(label);

      node.addEventListener('click', function () {
        if (state.activeTripId === trip.id) {
          state.setActiveTrip(null);
        } else {
          state.setActiveTrip(trip.id);
        }
      });

      track.appendChild(node);
    });

    timelineEl.appendChild(track);
  }

  function highlightTimelineNode(tripId) {
    if (!timelineEl) return;
    var nodes = timelineEl.querySelectorAll('.timeline-node');
    for (var i = 0; i < nodes.length; i++) {
      var isActive = nodes[i].getAttribute('data-trip-id') === tripId;
      nodes[i].classList.toggle('active', isActive);

      // Scroll active node into view
      if (isActive) {
        nodes[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  // ===================================================================
  // MOBILE TABS
  // ===================================================================

  function setupTabs() {
    if (!tabsEl) return;

    var tabs = tabsEl.querySelectorAll('.travel-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', (function (tab) {
        return function () {
          switchTab(tab.getAttribute('data-tab'));
        };
      })(tabs[i]));
    }
  }

  function switchTab(tabName) {
    if (!tabsEl) return;

    var tabs = tabsEl.querySelectorAll('.travel-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tabName);
    }

    tabMapEl.classList.toggle('active', tabName === 'map');
    tabTimelineEl.classList.toggle('active', tabName === 'timeline');
    if (tabName === 'timeline') {
      requestAnimationFrame(renderFlightPath);
    }
  }

  // ===================================================================
  // TIMELINE CARDS (mobile vertical list)
  // ===================================================================

  function renderTimelineCards() {
    if (!timelineCardsEl) return;
    timelineCardsEl.innerHTML = '';

    var sorted = trips.slice().sort(function (a, b) {
      return a.trip_start < b.trip_start ? 1 : -1;
    });

    sorted.forEach(function (trip, i) {
      var card = document.createElement('a');
      card.className = 'svw-postcard timeline-postcard ' +
        (i % 2 === 0 ? 'timeline-postcard--left' : 'timeline-postcard--right');
      card.setAttribute('data-trip-id', trip.id);
      if (trip.gallery) { card.href = trip.gallery; }

      if (trip.flag) {
        var flag = document.createElement('span');
        flag.className = 'svw-postcard__flag';
        flag.textContent = trip.flag;
        card.appendChild(flag);
      }

      if (trip._gallery && trip._gallery.cover) {
        var img = document.createElement('img');
        img.src = trip._gallery.cover;
        img.alt = trip.title;
        img.className = 'svw-postcard__photo';
        img.loading = 'lazy';
        card.appendChild(img);
      }

      var body = document.createElement('div');
      body.className = 'svw-postcard__body';

      var title = document.createElement('div');
      title.className = 'svw-postcard__title';
      title.textContent = trip.title;
      body.appendChild(title);

      var meta = document.createElement('div');
      meta.className = 'svw-postcard__meta';
      meta.textContent = formatDateRange(trip.trip_start, trip.trip_end);
      body.appendChild(meta);

      if (trip.description) {
        var desc = document.createElement('p');
        desc.style.cssText = 'font-size:var(--fs-body-sm);color:var(--color-ink-soft);margin-top:6px;line-height:1.5;';
        desc.textContent = trip.description;
        body.appendChild(desc);
      }

      card.appendChild(body);
      timelineCardsEl.appendChild(card);
    });
  }

  function renderFlightPath() {
  if (!timelineCardsEl) return;

  // Remove existing SVG if present
  var existing = timelineCardsEl.querySelector('.timeline-flight-svg');
  if (existing) existing.remove();

  var cards = Array.from(timelineCardsEl.querySelectorAll('.timeline-postcard'));
  if (cards.length < 2) return;

  var containerRect = timelineCardsEl.getBoundingClientRect();
  if (containerRect.width === 0) return; // hidden tab — bail

  var ns = 'http://www.w3.org/2000/svg';
  var svgEl = document.createElementNS(ns, 'svg');
  svgEl.setAttribute('class', 'timeline-flight-svg');
  svgEl.setAttribute('aria-hidden', 'true');

  var defs = document.createElementNS(ns, 'defs');
  var style = document.createElementNS(ns, 'style');
  style.textContent = [
    '@keyframes planeTrace {',
    '  0% { opacity: 0; offset-distance: 100%; }',
    ' 10% { opacity: 1; }',
    ' 90% { opacity: 1; }',
    '100% { opacity: 0; offset-distance: 0%; }',
    '}'
  ].join('\n');
  defs.appendChild(style);
  svgEl.appendChild(defs);

  for (var i = 0; i < cards.length - 1; i++) {
    var fromRect = cards[i].getBoundingClientRect();
    var toRect   = cards[i + 1].getBoundingClientRect();

    // Center-bottom of departure card → center-top of arrival card
    var x1 = fromRect.left - containerRect.left + fromRect.width / 2;
    var y1 = fromRect.top  - containerRect.top  + fromRect.height;
    var x2 = toRect.left   - containerRect.left + toRect.width  / 2;
    var y2 = toRect.top    - containerRect.top;

    // Cubic bezier: depart downward, arrive from above
    var cy = (y1 + y2) / 2;
    var pathD = 'M ' + x1 + ' ' + y1 +
                ' C ' + x1 + ' ' + cy + ',' +
                        x2 + ' ' + cy + ',' +
                        x2 + ' ' + y2;

    // Dashed path
    var pathEl = document.createElementNS(ns, 'path');
    pathEl.setAttribute('d', pathD);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', 'var(--accent)');
    pathEl.setAttribute('stroke-width', '2');
    pathEl.setAttribute('stroke-dasharray', '6 6');
    pathEl.setAttribute('opacity', '0.6');
    svgEl.appendChild(pathEl);

    // Animated plane emoji along the path
    var pathId = 'flight-path-' + i;
    pathEl.setAttribute('id', pathId);

    var text = document.createElementNS(ns, 'text');
    text.setAttribute('font-size', '18');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--accent)');
    text.style.cssText = [
      'offset-path: path("' + pathD.replace(/"/g, '\'') + '")',
      'offset-distance: 0%',
      'offset-rotate: auto 180deg',
      'animation: planeTrace 4s ease-in-out ' + (i * 1.5) + 's infinite'
    ].join(';');
    text.textContent = '✈︎';
    svgEl.appendChild(text);
  }

  timelineCardsEl.insertBefore(svgEl, timelineCardsEl.firstChild);
}

  // ===================================================================
  // FLIGHT LINES
  // ===================================================================

  function renderFlightLines() {
    if (trips.length < 2) return;

    var flightGroup = g.insert('g', '.map-border')
      .attr('class', 'flight-lines-layer');

    var now = new Date();

    for (var i = 0; i < trips.length - 1; i++) {
      var fromTrip = trips[i];
      var toTrip = trips[i + 1];
      var fromCode = fromTrip.country_codes[0];
      var toCode = toTrip.country_codes[0];

      // Skip if same country or missing coordinates
      if (fromCode === toCode) continue;
      if (!countryCoords[fromCode] || !countryCoords[toCode]) {
        console.warn('Flight line skipped — missing coords:', fromCode, '→', toCode);
        continue;
      }

      var fromPt = projection(countryCoords[fromCode]);
      var toPt = projection(countryCoords[toCode]);

      // Quadratic bezier: control point offset upward by dist * 0.3
      var dx = toPt[0] - fromPt[0];
      var dy = toPt[1] - fromPt[1];
      var dist = Math.sqrt(dx * dx + dy * dy);
      var mx = (fromPt[0] + toPt[0]) / 2;
      var my = (fromPt[1] + toPt[1]) / 2 - dist * 0.3;

      var pathData = 'M' + fromPt[0] + ',' + fromPt[1] +
        ' Q' + mx + ',' + my +
        ' ' + toPt[0] + ',' + toPt[1];

      var isFuture = new Date(toTrip.trip_start) > now;

      flightGroup.append('path')
        .attr('class', 'flight-line' + (isFuture ? ' future' : ''))
        .attr('d', pathData)
        .attr('data-from-trip', fromTrip.id)
        .attr('data-to-trip', toTrip.id)
        .on('click', (function (earlierTripId) {
          return function (event) {
            event.stopPropagation();
            state.setActiveTrip(earlierTripId);
          };
        })(fromTrip.id));
    }
  }

  function highlightFlightLines(tripId) {
    var lines = g.selectAll('.flight-line');
    if (!lines.size()) return;

    lines.classed('active', function () {
      if (!tripId) return false;
      return this.getAttribute('data-from-trip') === tripId ||
             this.getAttribute('data-to-trip') === tripId;
    });
  }

  // ===================================================================
  // UTILITIES
  // ===================================================================

  function formatDate(dateStr) {
    var parts = dateStr.split('-');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  function formatDateRange(startStr, endStr) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Handle ISO date strings (may include time component)
    var s = String(startStr).substring(0, 10).split('-');
    var e = String(endStr).substring(0, 10).split('-');

    var sMonth = months[parseInt(s[1], 10) - 1];
    var eMonth = months[parseInt(e[1], 10) - 1];
    var sDay = parseInt(s[2], 10);
    var eDay = parseInt(e[2], 10);
    var sYear = s[0];
    var eYear = e[0];

    if (sYear === eYear && sMonth === eMonth) {
      return sMonth + ' ' + sDay + '–' + eDay + ', ' + sYear;
    } else if (sYear === eYear) {
      return sMonth + ' ' + sDay + ' – ' + eMonth + ' ' + eDay + ', ' + sYear;
    } else {
      return sMonth + ' ' + sDay + ', ' + sYear + ' – ' + eMonth + ' ' + eDay + ', ' + eYear;
    }
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
    // Re-render geo paths (countries, borders, states)
    g.selectAll('.map-country, .map-border, .map-state').attr('d', path);
    // Flight lines disabled — will fix later

    if (activeLocation && sidebar.classList.contains('open')) {
      state.setActiveTrip(null);
    }

    if (tabTimelineEl && tabTimelineEl.classList.contains('active')) {
      renderFlightPath();
    }
  }

  // ===================================================================
  // START
  // ===================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
