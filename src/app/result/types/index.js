import functionalDependency from './fd';
import uniqueColumnCombination from './ucc';
import basicStatistic from './basicStat';
import denialConstraint from './dc';
import inclusionDependency from './ind';
import conditionalUniqueColumnCombination from './cucc';
import orderDependency from './od';
import multivaluedDependency from './mvd';

export default {
  uniqueColumnCombination,
  functionalDependency,
  basicStatistic,
  denialConstraint,
  inclusionDependency,
  conditionalUniqueColumnCombination,
  orderDependency,
  multivaluedDependency
}
