import {useCallback} from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {createQueryUrl} from '../../utils/navigation';
import {QueryItem} from '../../../../types/query-tracker/api';
import {getCluster} from '../../../../store/selectors/global';
import {getQuery} from '../../../../store/selectors/queries/query';

export const useQueryNavigation = (): [QueryItem['id'] | undefined, (id: QueryItem) => void] => {
    const selectedItem = useSelector(getQuery);
    const cluster = useSelector(getCluster);
    const history = useHistory();

    const goToQuery = useCallback(
        (item: QueryItem) => {
            history.push(createQueryUrl(cluster, item.id));
        },
        [cluster, history],
    );

    return [selectedItem?.id, goToQuery];
};
