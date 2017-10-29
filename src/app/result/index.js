import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './result.routes';
import ResultController from './result.controller';
import backend from '../backend';

export default angular.module('Metanome.result', [uirouter, backend])
  .config(routing)
  .controller('ResultController', ResultController)
  .name;
