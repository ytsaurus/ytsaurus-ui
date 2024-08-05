import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {SHARED_QUERY_ACO} from '../../module/query/selectors';

export const hideSharedAco: <T>(aco: T[]) => T[] = (aco) => {
    return aco.filter((i) => {
        const value = typeof i === 'string' ? i : (i as SelectOption).value;
        return value !== SHARED_QUERY_ACO;
    });
};
