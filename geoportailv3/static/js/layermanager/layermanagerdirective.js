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
goog.provide('app.layermanagerDirective');

goog.require('app');


/**
 * @param {string} appLayermanagerTemplateUrl Url to layermanager template
 * @return {angular.Directive} The Directive Definition Object.
 * @ngInject
 */
app.layermanagerDirective = function(appLayermanagerTemplateUrl) {
  return {
    restrict: 'E',
    scope: {
      'map': '=appLayermanagerMap',
      'layers': '=appLayermanagerLayers'
    },
    controller: 'AppLayermanagerController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: appLayermanagerTemplateUrl
  };
};


app.module.directive('appLayermanager', app.layermanagerDirective);



/**
 * @constructor
 * @export
 */
app.LayermanagerController = function() {
  this['uid'] = goog.getUid(this);
};


/**
 * @param {ol.layer.Layer} layer Layer.
 * @export
 */
app.LayermanagerController.prototype.removeLayer = function(layer) {
  this['map'].removeLayer(layer);
};


app.module.controller('AppLayermanagerController', app.LayermanagerController);