const fdHandler = (scopeObj) => (result) => {
  var determinant = [];
  result.result.determinant.columnIdentifiers.forEach(function(combination) {
    if (combination.tableIdentifier && combination.columnIdentifier) {
      determinant.push(combination.tableIdentifier + '.' + combination.columnIdentifier);
    } else {
      determinant.push('');
    }
  });
  var extendedDependant = [];
  if (result.extendedDependant) {
    result.extendedDependant.columnIdentifiers.forEach(function(combination) {
      if (combination.tableIdentifier && combination.columnIdentifier) {
        extendedDependant.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
      } else {
        determinant.push('');
      }
    })
  }
  var dependant = '';
  if (result.dependant.tableIdentifier && result.dependant.columnIdentifier) {
    dependant = result.dependant.tableIdentifier + '.' + result.dependant.columnIdentifier;
  }

  return {
    determinant: '[' + determinant.join(',\n ') + ']',
    dependant: dependant,
    extendedDependant: '[' + extendedDependant.join(',\n ') + ']',
    determinantColumnRatio: result.determinantColumnRatio,
    dependantColumnRatio: result.dependantColumnRatio,
    determinantOccurrenceRatio: result.determinantOccurrenceRatio,
    dependantOccurrenceRatio: result.dependantOccurrenceRatio,
    generalCoverage: result.generalCoverage,
    determinantUniquenessRatio: result.determinantUniquenessRatio,
    dependantUniquenessRatio: result.dependantUniquenessRatio,
    pollution: result.pollution,
    pollutionColumn: result.pollutionColumn,
    informationGainCell: result.informationGainCells,
    informationGainByte: result.informationGainBytes
  };
}

export default {
  type: 'Functional Dependency',
  sort: 'Determinant',
  resultHandler: fdHandler,
  test: 'fd',
  columnNames: [
    { name: 'Determinant', order: 'determinant' },
    { name: 'Dependant', order: 'dependant' },
  ],
  extendedColumnNames: [
    { name: 'Extended Dependant', order: 'extendedDependant' },
    { name: 'Determinant Column Ratio', order: 'determinantColumnRatio' },
    { name: 'Dependant Column Ratio', order: 'dependantColumnRatio' },
    { name: 'Determinant Occurrence Ratio', order: 'determinantOccurrenceRatio' },
    { name: 'Dependant Occurrence Ratio', order: 'dependantOccurrenceRatio' },
    { name: 'General Coverage', order: 'generalCoverage' },
    { name: 'Determinant Uniqueness Ratio', order: 'determinantUniquenessRatio' },
    { name: 'Dependant Uniqueness Ratio', order: 'dependantUniquenessRatio' },
    { name: 'Information Gain Cell', order: 'informationGainCell' },
    { name: 'Information Gain Byte', order: 'informationGainByte' },
    { name: 'Pollution', order: 'pollution' },
    { name: 'Pollution Column', order: 'pollutionColumn' },
  ],
  visualization: 'FD',
};
