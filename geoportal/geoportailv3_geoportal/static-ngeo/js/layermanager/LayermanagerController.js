/**
 * @fileoverview This file provides the layer manager directive. That directive
 * is used to create the list of selected layers in the page.
 *
 * Example:
 *
 * <app-layermanager app-layermanager-map="::mainCtrl.map"
 *     app-layermanager-layers="::mainCtrl.selectedLayers">
 * </app-layermanager>
 *
 * Note the use of the one-time binding operator (::) in the map and layers
 * expressions. One-time binding is used because we know the map and the array
 * of layers are not going to change during the lifetime of the application.
 * The content of the array of layers may change, but not the array itself.
 */

import appModule from '../module.js';
import {getUid} from 'ol/index.js';
import olSourceWMTS from 'ol/source/WMTS.js';
import MapboxLayer from '@geoblocks/mapboxlayer/src/MapBoxLayer.js';

class Controller {
  /**
   * @param {ngeo.statemanager.Location} ngeoLocation Location service.
   * @param {ngeo.map.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer manager.
   * @param {angular.$rootScope} $rootScope Angular rootScope service.
   * @ngInject
   */
  constructor(ngeoLocation, ngeoBackgroundLayerMgr, $rootScope){

    this.ngeoLocation_ = ngeoLocation;

    this.ngeoBackgroundLayerMgr_ = ngeoBackgroundLayerMgr;

    this.uid = getUid(this);

    /**
     * Hash array to keep track of opacities set on layers.
     */
    this.opacities_ = {};

    this.activeMvt = false;

    /**
     * @type {angular.$rootScope}
     */
    this.$rootScope = $rootScope;
    this.layers3d = this.map.get('ol3dm')

    $rootScope.$watch(
      () => this.map.get('ol3dm') && this.map.get('ol3dm').is3dEnabled(),
      isEnabled => isEnabled && this.enable3d()
    )

  };

  get background() {
    let background = this.ngeoBackgroundLayerMgr_.get(this.map);
    if (background) {
      this.activeMvt = background instanceof MapboxLayer;
      this.backgroundInfo = background;
      return background.get('label');
    }
    return null;
  }

  removeLayer(layer) {
    this.map.removeLayer(layer);
  }

  remove3dLayer(layerName) {
    this.map.get('ol3dm').remove3dLayer(layerName)
    const idx = this.layers3d.findIndex(e => e.url.includes(layerName));
    this.layers3dName.splice(idx, 1);
  }

  enable3d() {
    this.layers3d = this.map.get('ol3dm').tilesets3d;
    this.layers3dName = this.map.get('ol3dm').getActiveLayerName();
  }

  setTime(layer, time) {
    if (layer.type == 'IMAGE') {
      let dd = new Date(time.start)
      let pp = layer.getSource().getParams();
      pp['TIME'] = dd.toISOString();
      layer.getSource().updateParams(pp);
    }
    else if (layer.type == 'TILE') {
      let WMTS_source = layer.getSource();
      let isWmts = WMTS_source instanceof olSourceWMTS;
      if (isWmts) {
        let dd = new Date(time.start);
        let oldLayer = WMTS_source.getLayer();
        let newLayer = layer.get('metadata')['time_layers'][dd.toISOString().split('.')[0]+"Z"];
        let oldUrls = WMTS_source.getUrls();
        let newUrls = oldUrls.map((url) => url.replace(/\/[^\/]*\/{TileMatrixSet}/, '/' + newLayer + '/{TileMatrixSet}'))
        WMTS_source.setUrls(newUrls);
        layer.set('label', newLayer);
      }
    }
  }

  reorderCallback(element, layers){
    for (var i = 0; i < layers.length; i++) {
      layers[i].setZIndex(layers.length - i);
    }
  }

  changeVisibility(layer) {
    var currentOpacity = layer.getOpacity();
    var newOpacity;
    var uid = getUid(layer);
    if (currentOpacity === 0) {
      if (this.opacities_[uid] !== undefined) {
        newOpacity = this.opacities_[uid];
      } else {
        newOpacity = 1;
      }
      // reset old opacity for later use
      delete this.opacities_[uid];
    } else {
      this.opacities_[uid] = currentOpacity;
      newOpacity = 0;
    }
    layer.setOpacity(newOpacity);
  }

  isLayersComparatorDisplayed() {
    return this['activeLC'] === true;
  }


  toggleLayersComparator() {
    this['activeLC'] = !this['activeLC'];
    this.ngeoLocation_.updateParams({
      'lc': this['activeLC']
    });
  }

  enable3d() {
    this.layers3d = this.map.get('ol3dm').tilesets3d;
    this.layers3dName = this.map.get('ol3dm').tiles3dLayers_;
  }

  openMvtEditorPanel() {
    this.$rootScope.$broadcast('mvtPanelOpen');
  }
};

appModule.controller('AppLayermanagerController', Controller);

export default Controller;
