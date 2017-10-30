const odHandler = (scopeObj) => (result) => {
  var combinations = [];
  result.result.lhs.columnIdentifiers.forEach(function(combination) {
    combinations.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  var referenced = [];
  result.result.rhs.columnIdentifiers.forEach(function(combination) {
    referenced.push(combination.tableIdentifier + '.' + combination.columnIdentifier)
  });
  var ordertype = 'Lexicographical';
  if (result.orderType === 'POINTWISE') {
    ordertype = 'Pointwise'
  }
  var comparisonOperator = '<';
  if (result.comparisonOperator === 'SMALLER_EQUAL') {
    comparisonOperator = '<='
  }

  return {
    LHS: '[' + combinations.join(',\n ') + ']',
    RHS: '[' + referenced.join(',\n ') + ']',
    ComparisonOperator: comparisonOperator,
    OrderType: ordertype,
    LHSColumnRatio: result.lhsColumnRatio,
    RHSColumnRatio: result.rhsColumnRatio,
    GeneralCoverage: result.generalCoverage,
    LHSOccurrenceRatio: result.lhsOccurrenceRatio,
    RHSOccurrenceRatio: result.rhsOccurrenceRatio,
    LHSUniquenessRatio: result.lhsUniquenessRatio,
    RHSUniquenessRatio: result.rhsUniquenessRatio
  };
}

export default {
  type: 'Order Dependency',
  sort: 'LHS',
  resultHandler: odHandler,
  test: 'od',
  columnNames: [
    { name: 'LHS', order: 'LHS' },
    { name: 'RHS ', order: 'RHS' },
    { name: 'Order Type', order: 'OrderType' },
    { name: 'Comparison Operator', order: 'ComparisonOperator' },
  ],
  extendedColumnNames: [
    { name: 'LHS Column Ratio', order: 'LHSColumnRatio' },
    { name: 'RHS Column Ratio', order: 'RHSColumnRatio' },
    { name: 'General Coverage', order: 'GeneralCoverage' },
    { name: 'LHS Occurrence Ratio', order: 'LHSOccurrenceRatio' },
    { name: 'RHS Occurrence Ratio', order: 'RHSOccurrenceRatio' },
    { name: 'LHS Uniqueness Ratio', order: 'LHSUniquenessRatio' },
    { name: 'RHS Uniqueness Ratio', order: 'RHSUniquenessRatio' },
  ],
};
