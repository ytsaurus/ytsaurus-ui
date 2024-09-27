import React, {FC} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueryClusterItem} from '../../QueryTrackerTopRow/QueryClusterSelector/QueryClusterItem';
import {TableDataItem} from '@gravity-ui/uikit';
import './ClusterList.scss';
import cn from 'bem-cn-lite';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {setNavigationCluster} from '../../module/queryNavigation/actions';
import {selectClustersByFilter} from '../../module/queryNavigation/selectors';
import {TableWithSorting} from '../NodeList/TableWithSorting';

const b = cn('navigation-cluster-list');

export const ClusterList: FC = () => {
    const dispatch = useDispatch();
    const clusters = useSelector(selectClustersByFilter);

    const handleClusterClick = (cluster: TableDataItem) => {
        dispatch(setNavigationCluster(cluster.id));
    };

    return (
        <div className={b()}>
            <TableWithSorting
                data={clusters}
                columns={[
                    {
                        className: b('row'),
                        id: 'name',
                        name: 'Name',
                        template: ({id, name, environment}) => (
                            <QueryClusterItem
                                key={id}
                                id={id}
                                name={name}
                                environment={environment}
                                className={b('table-row')}
                            />
                        ),
                        meta: {
                            sort: (aCluster: ClusterConfig, bCluster: ClusterConfig) => {
                                return aCluster.name.localeCompare(bCluster.name);
                            },
                        },
                    },
                ]}
                onRowClick={handleClusterClick}
            />
        </div>
    );
};
