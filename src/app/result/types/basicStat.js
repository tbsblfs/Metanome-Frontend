
const basicStatHandler = (scopeObj) => (result) => {
  if(!scopeObj.columnNamesMap) scopeObj.columnNamesMap = {};

  var combinations = [];
  result.result.columnCombination.columnIdentifiers.forEach(function(combination) {
    combinations.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  var entry = {
    columnCombination: '[' + combinations.join(',\n ') + ']',
    columnRatio: result.columnRatio,
    occurrenceRatio: result.occurrenceRatio,
    uniquenessRatio: result.uniquenessRatio
  };
  for (var columnName in result.result.statisticMap) {
    if(!scopeObj.columnNamesMap[columnName]) {
      scopeObj.columnNamesMap[columnName] = true;
      scopeObj.columnNames.push({
        'name': columnName,
        'order': columnName.replace(/\s/g, '_')
      });
    }
    entry[columnName.replace(/\s/g, '_')] = result.result.statisticMap[columnName].value;
  }
  return entry;
}

export default {
  type: 'Basic Statistic',
  sort: 'Column Combination',
  resultHandler: basicStatHandler,
  short: 'basicStat',
  columnNames: [
    { name: 'Column Combination', order: 'columnCombination' }
  ],
  extendedColumnNames: [
    { name: "Column Ratio", order: "columnRatio" },
    { name: "Occurrence Ratio", order: "occurrenceRatio" },
    { name: "Uniqueness Ratio", order: "uniquenessRatio"},
  ]
};
