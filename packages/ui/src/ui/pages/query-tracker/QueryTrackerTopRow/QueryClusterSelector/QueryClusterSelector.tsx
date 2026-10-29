import React, {type FC, type ReactElement} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {Select} from '@gravity-ui/uikit';

import {QuerySelector} from '../QuerySelector';
import {QueryClusterItem, type Props as QueryClusterItemProps} from './QueryClusterItem';
import {isMultiClusterInstallation} from '../../../../config/yt-config';
import {
    selectClusterLoading,
    selectQueryDraft,
} from '../../../../store/selectors/query-tracker/query';
import {selectQueryClusters} from '../../../../store/selectors/query-tracker/querySettings';
import {setQueryCluster} from '../../../../store/actions/query-tracker/query';

type Props = {
    className?: string;
};

export const QueryClusterSelector: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const loading = useSelector(selectClusterLoading);
    const values = useSelector(selectQueryClusters);
    const {settings} = useSelector(selectQueryDraft);
    const isMultiCluster = isMultiClusterInstallation();

    const handleOnChange = (clusterId: string) => {
        dispatch(setQueryCluster(clusterId));
    };

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
                if (!option.children) return <></>;

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
