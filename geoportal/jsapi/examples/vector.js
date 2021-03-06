goog.provide('vector');

goog.require('common');
goog.require('lux.Map');

var map = new lux.Map({
  target           : 'mapContainer',
  position         : [ 6.13, 49.61 ],
  positionSrs      : '4326',
  zoom             : 14,
  mousePosition    : {
    target: 'mapContainer',
    srs : 4326
  }
});

map.addGPX('gpx-trace.gpx?fdfd=f', {
  reloadInterval: 5
});
map.addKML('elements.kml');
