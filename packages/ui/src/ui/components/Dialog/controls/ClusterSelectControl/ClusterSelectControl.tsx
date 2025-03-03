import React from 'react';
import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import filter_ from 'lodash/filter';

import Select, {YTSelectProps} from '../../../../components/Select/Select';

import './ClusterSelectControl.scss';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {YT} from '../../../../config/yt-config';

const block = cn('cluster-select-control');

interface Props {
    className?: string;

    value: string;
    onChange: (value: Props['value']) => void;

    isLanding?: boolean;

    placeholder?: string;

    disabled?: boolean;

    excludeClusters?: Array<string>;

    filterPredicate?: (cluster: ClusterConfig) => boolean;

    width?: YTSelectProps['width'];
}

function ClusterSelectControl({
    className,
    excludeClusters,
    onChange,
    value,
    placeholder,
    disabled,
    filterPredicate = () => true,
    width,
}: Props) {
    const clusters = React.useMemo(() => {
        const res = map_(filter_(YT.clusters, filterPredicate), ({name, id}) => ({
            value: id,
            text: name,
        }));

        return res;
    }, [filterPredicate]);

    const items = React.useMemo(() => {
        if (!excludeClusters?.length) {
            return clusters;
        }

        const toSkip = new Set(excludeClusters);
        return filter_(clusters, ({value}) => {
            return !toSkip.has(value);
        });
    }, [clusters, excludeClusters]);

    const handleChange = React.useCallback(
        (value: Array<string>) => {
            onChange(value[0]);
        },
        [onChange],
    );

    return (
        <React.Fragment>
            <Select
                value={[value]}
                className={block({empty: !value}, className)}
                onUpdate={handleChange}
                items={items}
                placeholder={placeholder ?? 'Cluster...'}
                disabled={disabled}
                width={width}
            />
        </React.Fragment>
    );
}

ClusterSelectControl.getDefaultValue = () => {
    return '';
};

ClusterSelectControl.isEmpty = (value: string) => {
    return !value;
};

export default ClusterSelectControl;
