const mvdHandler = (scopeObj) => (result) => {
  var determinants = [];
  result.result.determinant.columnIdentifiers.forEach(function(determinant) {
    determinants.push(determinant.tableIdentifier + '.' + determinant.columnIdentifier)
  });
  var dependants = [];
  result.result.dependant.columnIdentifiers.forEach(function(dependant) {
    dependants.push(dependant.tableIdentifier + '.' + dependant.columnIdentifier)
  });
  return {
    determinant: '[' + determinants.join(',\n ') + ']',
    dependant: '[' + dependants.join(',\n ') + ']',
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
  type: 'Multivalued Dependency',
  sort: 'Determinant',
  resultHandler: mvdHandler,
  test: 'mvd',
};
