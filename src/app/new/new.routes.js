export default function routes($stateProvider) {
  $stateProvider
    .state('new', {
      url: '/new',
      template: require('./new.html'),
      controller: 'NewController',
      controllerAs: 'new'
    });
}
