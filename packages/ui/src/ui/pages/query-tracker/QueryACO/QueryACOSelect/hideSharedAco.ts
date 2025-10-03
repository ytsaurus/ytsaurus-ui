import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {SHARED_QUERY_ACO} from '../../../../store/selectors/queries/query';

export function hideSharedAco<T extends string | SelectOption>(aco: T[]): T[] {
    return aco.filter((i) => {
        const value = typeof i === 'string' ? i : i.value;
        return value !== SHARED_QUERY_ACO;
    });
}
