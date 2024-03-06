import React, {FC} from 'react';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {QueryClusterItem} from './QueryClusterItem';
import {Select} from '@gravity-ui/uikit';
import {QuerySelector} from '../QuerySelector';

type Props = {
    clusters: ClusterConfig[];
    value: string | undefined;
    onChange: (clusterId: string) => void;
};

export const QueryClusterSelector: FC<Props> = ({clusters, value, onChange}) => {
    return (
        <QuerySelector
            placeholder="Cluster"
            filterPlaceholder="Search"
            items={clusters}
            onChange={onChange}
            hasClear
            value={value}
            getOptionHeight={() => 52}
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
