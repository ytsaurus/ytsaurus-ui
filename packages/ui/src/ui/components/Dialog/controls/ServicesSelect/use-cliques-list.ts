import {useSelector} from 'react-redux';

import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';

import {useChytFetchQuery} from '../../../../store/api/chyt';
import {getCluster} from '../../../../store/selectors/global';
import {isDeveloper} from '../../../../store/selectors/global/is-developer';

import {defaultColumns} from '../../../../constants/chyt';

export function useCliquesList() {
    const cluster = useSelector(getCluster);
    const isAdmin = useSelector(isDeveloper);
    const attributesSet = new Set([
        'yt_operation_id' as const,
        'creator' as const,
        'state' as const,
        'health' as const,
        'health_reason' as const,
        ...defaultColumns,
    ]);

    const {cliques, isCliquesLoading} = useChytFetchQuery(
        ['list', cluster, {attributes: [...attributesSet]}, {isAdmin}],
        {
            selectFromResult: (state) => ({
                cliques:
                    state?.data && 'result' in state.data && state.data.result
                        ? map_(state.data.result, (item) => ypath.getValue(item))
                        : [],
                isCliquesLoading: state.isLoading,
            }),
        },
    );

    return {cliques, isCliquesLoading};
}
