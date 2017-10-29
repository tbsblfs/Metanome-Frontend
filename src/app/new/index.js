import angular from 'angular';
import uirouter from 'angular-ui-router';
import ngDialog from 'ng-dialog';
import 'angular-spinner';
import 'angular-schema-form';
import 'angular-schema-form-bootstrap';

import routing from './new.routes';
import NewController from './new.controller';
import backend from '../backend';

export default angular.module('Metanome.new', [uirouter, ngDialog, backend, 'angularSpinner', 'schemaForm'])
  .config(routing)
  .controller('NewController', NewController)
  .name;
