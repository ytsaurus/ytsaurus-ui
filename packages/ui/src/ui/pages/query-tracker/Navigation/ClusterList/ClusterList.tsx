import React, {FC} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueryClusterItem} from '../../QueryTrackerTopRow/QueryClusterSelector/QueryClusterItem';
import './ClusterList.scss';
import cn from 'bem-cn-lite';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {setNavigationCluster} from '../../module/queryNavigation/actions';
import {selectClustersByFilter, selectLoading} from '../../module/queryNavigation/selectors';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';

const b = cn('navigation-cluster-list');

export const ClusterList: FC = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const clusters = useSelector(selectClustersByFilter);

    const handleClusterClick = (cluster: ClusterConfig) => {
        dispatch(setNavigationCluster(cluster.id));
    };

    return (
        <DataTableYT
            className={b()}
            rowClassName={() => b('row')}
            settings={{
                stickyHead: 'moving',
                displayIndices: false,
                sortable: true,
                highlightRows: false,
            }}
            data={clusters}
            columns={[
                {
                    name: 'name',
                    header: (
                        <ColumnHeader
                            className={b('header')}
                            title="Name"
                            column="name"
                            loading={loading}
                        />
                    ),
                    render: (data) => {
                        const {id, name, environment} = data.row as ClusterConfig;
                        return (
                            <QueryClusterItem
                                key={id}
                                id={id}
                                name={name}
                                environment={environment}
                                className={b('item')}
                            />
                        );
                    },
                },
            ]}
            useThemeYT
            onRowClick={handleClusterClick}
        />
    );
};
