// The MIT License (MIT)
//
// Copyright (c) 2015-2020 Camptocamp SA
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


/**
 * Application entry point.
 *
 * This file includes `import`'s for all the components/directives used
 * by the HTML page and the controller to provide the configuration.
 */

import './sass/vars_mobile.scss';
import './sass/mobile.scss';

import angular from 'angular';
import gmfControllersAbstractMobileController, {AbstractMobileController}
  from 'gmf/controllers/AbstractMobileController.js';
import geoportailv3Base from '../geoportailv3module.js';
import EPSG2056 from '@geoblocks/proj/src/EPSG_2056.js';
import EPSG21781 from '@geoblocks/proj/src/EPSG_21781.js';

if (!window.requestAnimationFrame) {
  alert('Your browser is not supported, please update it or use another one. You will be redirected.\n\n'
    + 'Votre navigateur n\'est pas supporté, veuillez le mettre à jour ou en utiliser un autre. '
    + 'Vous allez être redirigé.\n\n'
    + 'Ihr Browser wird nicht unterstützt, bitte aktualisieren Sie ihn oder verwenden Sie einen anderen. '
    + 'Sie werden weitergeleitet.');
  window.location.href = 'https://geomapfish.org/';
}


/**
 * @private
 */
class Controller extends AbstractMobileController {
  /**
   * @param {angular.IScope} $scope Scope.
   * @param {angular.auto.IInjectorService} $injector Main injector.
   * @ngInject
   */
  constructor($scope, $injector) {
    super({
      autorotate: false,
      srid: 2056,
      mapViewConfig: {
        center: [2632464, 1185457],
        zoom: 3,
        resolutions: [250, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05]
      }
    }, $scope, $injector);

    /**
     * @type {Array<import('gmf/mobile/measure/pointComponent.js').LayerConfig>}
     */
    this.elevationLayersConfig = [
      {name: 'aster', unit: 'm'},
      {name: 'srtm', unit: 'm'}
    ];

    /**
     * @type {string[]}
     */
    this.searchCoordinatesProjections = [EPSG21781, EPSG2056, 'EPSG:4326'];
  }
}

/**
 * @hidden
 */
const module = angular.module('Appmobile', [
  geoportailv3Base.name,
  gmfControllersAbstractMobileController.name,
]);

module.controller('MobileController', Controller);

export default module;
