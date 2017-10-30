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
};
