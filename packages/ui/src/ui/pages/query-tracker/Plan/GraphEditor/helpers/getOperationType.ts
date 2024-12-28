import {OperationType} from '../enums';
import {ProcessedNode} from '../../utils';

export const getOperationType = (
    operationName: string,
    type: ProcessedNode['type'],
): OperationType => {
    if (type !== 'op') {
        return OperationType.Table;
    }

    const loverCaseName = operationName.toLowerCase().trim();
    if (loverCaseName.includes('merge')) {
        return OperationType.Merge;
    }
    if (loverCaseName.includes('sort')) {
        return OperationType.Sort;
    }
    if (loverCaseName.includes('erase')) {
        return OperationType.Erase;
    }
    if (loverCaseName.includes('map')) {
        const reduce = loverCaseName.includes('reduce');
        return reduce ? OperationType.MapReduce : OperationType.Map;
    }
    if (loverCaseName.includes('reduce')) {
        return OperationType.Reduce;
    }
    if (loverCaseName.includes('read')) {
        return OperationType.Read;
    }
    if (loverCaseName.includes('commit')) {
        return OperationType.Commit;
    }
    return OperationType.Operation;
};
