const predicateOperators = {
  "EQUAL":"=",
  "UNEQUAL":"≠",
  "GREATER":">",
  "LESS":"<",
  "GREATER_EQUAL":"≥",
  "LESS_EQUAL":"≤",
}

const dcHandler = (scopeObj) => (result) => {
  var combinations = [];
  var tableNames = [];
  result.result.predicates.forEach(function(predicate) {
    var operator = predicateOperators[predicate.op] || predicate.op;
    if (predicate.type === "de.metanome.algorithm_integration.PredicateConstant") {
      tableNames[predicate.index1] = predicate.column1.tableIdentifier;
      combinations.push('t' + predicate.index1 + '.' + predicate.column1.columnIdentifier +
        operator + predicate.constant);
    } else if (predicate.type === "de.metanome.algorithm_integration.PredicateVariable") {
      tableNames[predicate.index1] = predicate.column1.tableIdentifier;
      tableNames[predicate.index2] = predicate.column2.tableIdentifier;
      combinations.push('t' + predicate.index1 + '.' + predicate.column1.columnIdentifier +
        operator + 't' + predicate.index2 + '.' + predicate.column2.columnIdentifier);
    }
  });
  var tuples = [];
  for (var index in tableNames) {
    if (tableNames.hasOwnProperty(index)) {
      tuples.push('t' + index + '∈' + tableNames[index]);
    }
  }

  return {
    predicates: '∀' + tuples.join(',') + ':\n¬[' + combinations.join('∧\n ') + ']',
    size: combinations.length,
  };
}

export default {
    type: 'Denial Constraint',
    sort: 'Predicates',
    resultHandler: dcHandler,
    short: 'dc',
    columnNames: [
      { order: "predicates", name: "Predicates" },
      { order: "size", name: "Size"},
    ],
    extendedColumnNames: [
    ],
};
