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
  short: 'ind',
  columnNames: [
    { name: 'Dependant', order: 'dependant' },
    { name: 'Referenced', order: 'referenced' },
  ],
  extendedColumnNames: [
    { name: 'Dependant Column Ratio', order: 'dependantColumnRatio' },
    { name: 'Referenced Column Ratio', order: 'referencedColumnRatio' },
    { name: 'Dependant Occurrence Ratio', order: 'dependantOccurrenceRatio' },
    { name: 'Referenced Occurrence Ratio', order: 'referencedOccurrenceRatio' },
    { name: 'Dependant Uniqueness Ratio', order: 'dependantUniquenessRatio' },
    { name: 'Referenced Uniqueness Ratio', order: 'referencedUniquenessRatio' },
  ]
};
