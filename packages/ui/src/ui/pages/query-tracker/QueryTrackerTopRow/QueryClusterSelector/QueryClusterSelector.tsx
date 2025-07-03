import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {Select} from '@gravity-ui/uikit';

import {ClusterConfig} from '../../../../../shared/yt-types';
import {getQueryTrackerInfoClusters} from '../../../../pages/query-tracker/module/query_aco/selectors';
import {QuerySelector} from '../QuerySelector';
import {QueryClusterItem} from './QueryClusterItem';
import {YT, isMultiClusterInstallation} from '../../../../config/yt-config';

type Props = {
    clusters: ClusterConfig[];
    value: string | undefined;
    onChange: (clusterId: string) => void;
};

export const QueryClusterSelector: FC<Props> = ({clusters, value, onChange}) => {
    const infoClusters = useSelector(getQueryTrackerInfoClusters);
    const isMultiCluster = isMultiClusterInstallation();

    const values = React.useMemo((): Array<Pick<ClusterConfig, 'id' | 'name' | 'environment'>> => {
        if (!infoClusters?.length) {
            return clusters;
        }

        if (YT.isLocalCluster) {
            return (
                infoClusters?.map((id) => {
                    return {id, name: id, environment: 'localmode'};
                }) ?? []
            );
        }
        const knownClusters = new Set(infoClusters);
        return clusters.filter((item) => {
            return knownClusters.has(item.id);
        });
    }, [clusters, infoClusters, YT.isLocalCluster]);

    if (!isMultiCluster) {
        return null;
    }

    return (
        <QuerySelector
            placeholder="Cluster"
            filterPlaceholder="Search"
            items={values}
            onChange={onChange}
            hasClear
            value={value}
            getOptionHeight={() => 52}
            qa="query-cluster-selector"
            popupWidth={200}
        >
            {(items) =>
                items.map(({id, name, environment}) => (
                    <Select.Option key={id} value={id}>
                        <QueryClusterItem id={id} name={name} environment={environment} />
                    </Select.Option>
                ))
            }
        </QuerySelector>
    );
};
