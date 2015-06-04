goog.provide('app.queryDirective');


/**
 * @param {string} appQueryTemplateUrl URL to directive template.
 * @return {angular.Directive} The Directive Definition Object.
 * @ngInject
 */
app.queryDirective = function(appQueryTemplateUrl) {
  return {
    restrict: 'E',
    scope: {
      'map': '=appQueryMap',
      'infoOpen': '=appQueryOpen'
    },
    controller: 'AppQueryController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: appQueryTemplateUrl
  };
};
app.module.directive('appQuery', app.queryDirective);



/**
 * @constructor
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$http} $http Angular $http service
 * @param {string} appQueryTemplatesPath Path
 *                 to find the intterogation templates.
 * @param {string} getInfoServiceUrl
 * @param {string} getRemoteTemplateServiceUrl
 * @export
 * @ngInject
 */
app.QueryController = function($scope, $http,
    appQueryTemplatesPath, getInfoServiceUrl,
    getRemoteTemplateServiceUrl) {

  this['content'] = [];
  /**
   * @type {string}
   * @private
   */
  this.templatePath_ = appQueryTemplatesPath;
  /**
   * @type {string}
   * @private
   */
  this.remoteTemplateUrl_ = getRemoteTemplateServiceUrl;

  /**
   * @type {ol.Map}
   */
  var map = this['map'];

  var defaultFill = new ol.style.Fill({
    color: [255, 255, 0, 0.6]
  });
  var circleStroke = new ol.style.Stroke({
    color: [255, 155, 55, 1],
    width: 3
  });

  var image = new ol.style.Circle({
    radius: 10,
    fill: defaultFill,
    stroke: circleStroke
  });

  var defaultStyle = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 0, 0.6]
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'white',
        width: 5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 3
      })
    })
  ];

  var styles = {
    point: [new ol.style.Style({
      image: image
    })],
    default: defaultStyle
  };

  /**
   * The draw overlay
   * @type {ol.FeatureOverlay}
   * @private
   */
  this.overlay_ = new ol.FeatureOverlay({map: map,
    style: function(feature, resolution) {
      if (feature.getGeometry().getType() == ol.geom.GeometryType.POINT ||
          feature.getGeometry().getType() == ol.geom.GeometryType.MULTI_POINT) {
        return styles.point;
      }
      return styles.default;
    }});

  $scope.$watch(goog.bind(function() {
    return this['infoOpen'];
  }, this), goog.bind(function(newVal, oldVal) {
    if (newVal === false) {
      this.clearFeatures_();
    }else {
      this.highlightFeatures_(this.lastHighlightedFeatures_);
    }
  }, this));

  map.on('singleclick', goog.bind(function(evt) {
    var layers = map.getLayers().getArray();
    var layersList = [];
    var layerLabel = {};
    for (var i = 0; i < layers.length; i++) {
      var metadata = layers[i].get('metadata');
      if (goog.isDefAndNotNull(metadata)) {
        if (metadata['is_queryable'] == 'true') {
          var queryableId = layers[i].get('queryable_id');
          layersList.push(queryableId);
          layerLabel[queryableId] = layers[i].get('label');
        }
      }
    }
    if (layersList.length > 0) {
      var buffer = 5;
      var ll = ol.proj.transform(
          map.getCoordinateFromPixel(
          [evt.pixel[0] - buffer, evt.pixel[1] - buffer]),
          map.getView().getProjection(), 'EPSG:2169');
      var ur = ol.proj.transform(
          map.getCoordinateFromPixel(
          [evt.pixel[0] + buffer, evt.pixel[1] + buffer]),
          map.getView().getProjection(), 'EPSG:2169');
      var box = ll.concat(ur);

      $http.get(
          getInfoServiceUrl,
          {params: {
            'layers': layersList.join(),
            'box': box.join()
          }}).then(
          goog.bind(function(resp) {
            goog.array.forEach(resp.data, function(item) {
              item['layerLabel'] = layerLabel[item.layer];
            });
            this['content'] = resp.data;
            this['infoOpen'] = true;
            this.clearFeatures_();
            this.lastHighlightedFeatures_ = [];
            for (var i = 0; i < resp.data.length; i++) {
              this.lastHighlightedFeatures_.push.apply(
                  this.lastHighlightedFeatures_,
                  resp.data[i].features
              );
            }
            this.highlightFeatures_(this.lastHighlightedFeatures_);
          },this));
    }
  },this));


  map.on('pointermove', goog.bind(function(evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var hit = map.forEachLayerAtPixel(pixel, function(layer) {
      if (goog.isDefAndNotNull(layer)) {
        var metadata = layer.get('metadata');
        if (goog.isDefAndNotNull(metadata)) {
          if (goog.isDefAndNotNull(metadata['is_queryable']) &&
              metadata['is_queryable']) {
            return true;
          }
        }
      }
      return false;
    });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  },this));
};


/**
 * @private
 */
app.QueryController.prototype.clearFeatures_ = function() {
  this.overlay_.getFeatures().clear();
};


/**
 * provides the template path according with the fact
 * that the template for the current layer is remote or not
 * @param {{remote_template: boolean, template: string, layer: string}} layer
 * @return {string} the template path.
 * @export
 */
app.QueryController.prototype.getTemplatePath = function(layer) {
  if (layer['remote_template'] === true) {
    return (this.remoteTemplateUrl_ + '?layer=' + layer['layer']);
  }
  return (this.templatePath_ + '/' + layer['template']);
};


/**
 * @param {Array<string>} features the features to highlight
 * @private
 */
app.QueryController.prototype.highlightFeatures_ = function(features) {

  var encOpt = {
    dataProjection: 'EPSG:2169',
    featureProjection: this['map'].getView().getProjection()
  };

  var jsonFeatures = (new ol.format.GeoJSON()).readFeatures({
    'type': 'FeatureCollection',
    'features': features},
  encOpt
  );
  var currentFeatures = this.overlay_.getFeatures();

  this.overlay_.setFeatures(currentFeatures.extend(jsonFeatures));
};
app.module.controller('AppQueryController',
                      app.QueryController);

