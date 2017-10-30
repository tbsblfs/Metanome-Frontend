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
};
