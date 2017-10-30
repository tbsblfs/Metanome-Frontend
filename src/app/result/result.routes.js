import types from './types';

export default function routes($stateProvider) {
  $stateProvider
    .state('result', {
      url: '/result/:resultId?cached&count&load&file&extended&' + Object.values(types).map(t => t.short).join('&'),
      template: require('./result.html'),
      controller: 'ResultController',
      controllerAs: 'result'
    });
}
