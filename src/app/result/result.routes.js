export default function routes($stateProvider) {
  $stateProvider
    .state('result', {
      url: '/result/:resultId?cached&count&load&file&extended&ind&od&ucc&cucc&fd&mvd&basicStat&dc',
      template: require('./result.html'),
      controller: 'ResultController',
      controllerAs: 'result'
    });
}
