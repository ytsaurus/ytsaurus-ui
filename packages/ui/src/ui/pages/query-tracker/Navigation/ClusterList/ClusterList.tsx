import React, {FC} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueryClusterItem} from '../../QueryTrackerTopRow/QueryClusterSelector/QueryClusterItem';
import './ClusterList.scss';
import cn from 'bem-cn-lite';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {setNavigationCluster} from '../../../../store/actions/queries/queryNavigation';
import {
    selectClustersByFilter,
    selectLoading,
} from '../../../../store/selectors/queries/queryNavigation';
import {ItemsList} from '../ItemsList';

const b = cn('navigation-cluster-list');

export const ClusterList: FC = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const clusters = useSelector(selectClustersByFilter);

    const handleClusterClick = (cluster: ClusterConfig) => {
        dispatch(setNavigationCluster(cluster.id));
    };

    return (
        <ItemsList
            className={b()}
            loading={loading}
            data={clusters}
            render={({id, name, environment}) => {
                return (
                    <QueryClusterItem
                        key={id}
                        id={id}
                        name={name}
                        environment={environment}
                        className={b('item')}
                    />
                );
            }}
            onClick={handleClusterClick}
        />
    );
};
