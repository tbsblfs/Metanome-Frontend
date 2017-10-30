const cuccHandler = (scopeObj) => (result) => {
  var combinations = [];
  result.result.columnCombination.columnIdentifiers.forEach(function (combination) {
    combinations.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  return {
    columnCombination: '[' + combinations.join(',\n ') + ']',
    condition: result.result.condition.columnIdentifier.tableIdentifier + '.' + result.result.condition.columnIdentifier.columnIdentifier + (result.result.condition.negated ? ' != ' : ' = ') + result.result.condition.columnValue,
    coverage: result.result.condition.coverage,
    columnRatio: result.columnRatio,
    occurrenceRatio: result.occurrenceRatio,
    uniquenessRatio: result.uniquenessRatio
  };
}

export default  {
  type: 'Conditional Unique Column Combination',
  sort: 'Dependant',
  resultHandler: cuccHandler,
  test: 'cucc',
  columnNames: [
    { name: 'Column Combination', order: 'columnCombination' },
    { name: 'Condition', order: 'condition' },
    { name: 'Coverage', order: 'coverage' },
  ],
  extendedColumnNames: [
    { name: 'Column Ratio', order: 'columnRatio' },
    { name: 'Occurrence Ratio', order: 'occurrenceRatio' },
    { name: 'Uniqueness Ratio', order: 'uniquenessRatio' },
  ]
};
