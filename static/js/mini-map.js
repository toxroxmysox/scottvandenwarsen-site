/**
 * Static Mini-Map for Homepage
 * Renders a non-interactive Mercator projection SVG.
 * Gallery countries are highlighted with an accent fill.
 */

(function () {
  'use strict';

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

  var container = document.getElementById('mini-map-container');
  if (!container) return;

  var width = container.clientWidth;
  var height = Math.min(width * 0.5, 400);

  var projection = d3.geoMercator()
    .scale(width / 6.5)
    .translate([width / 2, height / 1.4]);

  var path = d3.geoPath().projection(projection);

  var svg = d3.select('#mini-map-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'mini-map-svg');

  var g = svg.append('g');

  Promise.all([
    d3.json('/data/world-110m.json'),
    d3.json('/galleries.json')
  ]).then(function (results) {
    var worldData = results[0];
    var galleries = results[1];

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
        return 'mini-map-country' + (visited ? ' visited' : '');
      })
      .attr('d', path);

    // Country borders
    g.append('path')
      .datum(topojson.mesh(worldData, worldData.objects.countries, function (a, b) { return a !== b; }))
      .attr('class', 'mini-map-border')
      .attr('d', path);
  });

})();
