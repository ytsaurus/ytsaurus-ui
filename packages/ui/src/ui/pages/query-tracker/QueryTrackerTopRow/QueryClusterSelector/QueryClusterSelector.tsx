import React, {FC, ReactElement} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {Select} from '@gravity-ui/uikit';

import {ClusterConfig} from '../../../../../shared/yt-types';
import {getQueryTrackerInfoClusters} from '../../../../store/selectors/query-tracker/queryAco';
import {QuerySelector} from '../QuerySelector';
import {QueryClusterItem, Props as QueryClusterItemProps} from './QueryClusterItem';
import {YT, isMultiClusterInstallation} from '../../../../config/yt-config';
import {getClusterLoading, getQueryDraft} from '../../../../store/selectors/query-tracker/query';
import {getClusterList} from '../../../../store/selectors/slideoutMenu';
import {setQueryCluster} from '../../../../store/actions/query-tracker/query';

type Props = {
    className?: string;
};

export const QueryClusterSelector: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const infoClusters = useSelector(getQueryTrackerInfoClusters);
    const loading = useSelector(getClusterLoading);
    const clusters = useSelector(getClusterList);
    const {settings} = useSelector(getQueryDraft);
    const isMultiCluster = isMultiClusterInstallation();

    const handleOnChange = (clusterId: string) => {
        dispatch(setQueryCluster(clusterId));
    };

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
            size="l"
            className={className}
            disabled={loading}
            placeholder="Cluster"
            filterPlaceholder="Search"
            items={values}
            onChange={handleOnChange}
            value={settings?.cluster}
            getOptionHeight={() => 52}
            qa="query-cluster-selector"
            popupWidth={200}
            renderSelectedOption={(option) => {
                const {name} = (option.children as ReactElement<QueryClusterItemProps>).props;
                return <>{name}</>;
            }}
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
