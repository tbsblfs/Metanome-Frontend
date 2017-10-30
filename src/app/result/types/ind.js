const indHandler = (scopeObj) => (result) => {
  var combinations = [];
  result.result.dependant.columnIdentifiers.forEach(function(combination) {
    combinations.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  var referenced = [];
  result.result.referenced.columnIdentifiers.forEach(function(combination) {
    referenced.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  return {
    dependant: '[' + combinations.join(',\n ') + ']',
    referenced: '[' + referenced.join(',\n ') + ']',
    dependantColumnRatio: result.dependantColumnRatio,
    referencedColumnRatio: result.referencedColumnRatio,
    dependantOccurrenceRatio: result.dependantOccurrenceRatio,
    referencedOccurrenceRatio: result.referencedOccurrenceRatio,
    generalCoverage: result.generalCoverage,
    dependantUniquenessRatio: result.dependantUniquenessRatio,
    referencedUniquenessRatio: result.referencedUniquenessRatio
  };
}

export default {
  type: 'Inclusion Dependency',
  sort: 'Dependant',
  resultHandler: indHandler,
  test: 'ind',
};
