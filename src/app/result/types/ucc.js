const uccHandler = (scopeObj) => (result) => {
  var combinations = [];
  result.result.columnCombination.columnIdentifiers.forEach(function (combination) {
    combinations.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  return {
    columnCombination: '[' + combinations.join(',\n ') + ']',
    columnRatio: result.columnRatio,
    occurrenceRatio: result.occurrenceRatio,
    uniquenessRatio: result.uniquenessRatio,
    randomness: result.randomness
  };
};

export default {
  type: 'Unique Column Combination',
  sort: 'Column Combination',
  resultHandler: uccHandler,
  short: 'ucc',
  columnNames: [
    { name: 'Column Combination', order: 'columnCombination' },
  ],
  extendedColumnNames: [
    { name: 'Column Ratio', order: 'columnRatio' },
    { name: 'Occurrence Ratio', order: 'occurrenceRatio' },
    { name: 'Uniqueness Ratio', order: 'uniquenessRatio' },
    { name: 'Randomness', order: 'randomness' },
  ],
  visualization: 'UCC',
};
