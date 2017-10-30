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
};
