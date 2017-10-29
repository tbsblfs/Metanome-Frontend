'use strict';
import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';
import ngToaster from 'angularjs-toaster';
import ngDataTable from 'angular-material-data-table';
import about from './about';
import history from './history';
import newModule from './new';
import result from './result';

import 'bootstrap/dist/css/bootstrap.css';
import 'angular-material/angular-material.css';
import 'angular-material-data-table/dist/md-data-table.css';
import 'font-awesome/css/font-awesome.css';
import 'material-design-iconic-font/dist/css/material-design-iconic-font.css';
import 'ng-dialog/css/ngDialog.css';
import 'ng-dialog/css/ngDialog-theme-default.css';
import 'angularjs-toaster/toaster.css';
import './index.css';
import './font.css';

angular.module('Metanome', [
  ngAnimate,
  ngRouter,
  ngMaterial,
  ngDataTable,
  ngToaster,
  about,
  history,
  newModule,
  result,
])
  .config(function ($stateProvider, $urlRouterProvider, $qProvider) {
    $urlRouterProvider.otherwise('/new');
    $qProvider.errorOnUnhandledRejections(false);
  })
;
