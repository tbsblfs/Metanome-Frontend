export default function routes($stateProvider) {
  $stateProvider
    .state('history', {
      url: '/history',
      template: require('./history.html'),
      controller: 'HistoryController',
      controllerAs: 'history'
    });
}
