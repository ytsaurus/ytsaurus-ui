import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';
import axios from 'axios';

import {USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';
import ypath from '../../../../common/thor/ypath';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import Suggest from '../../../../components/Suggest/Suggest';

import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';

import './PoolSuggestControl.scss';

const block = cn('pool-suggest-control');

type Props = DialogControlProps<string> & {
    // If not defined then current cluster should be used
    cluster?: string;
    // If not defined then default pool tree should be used
    poolTree?: string;
    calculateValueOnPoolsLoaded?: (params: {loadedPoolNames: Array<string>}) => string;

    allowEmpty?: boolean;
    allowEphemeral?: boolean;

    disabled?: boolean;
};

/**
 * The suggest should be used to select pools of current cluster
 * @param props
 * @returns
 */
export function PoolSuggestControl(props: Props) {
    const {
        allowEmpty,
        allowEphemeral,
        value,
        onChange,
        placeholder,
        poolTree,
        cluster,
        calculateValueOnPoolsLoaded,
        disabled,
    } = props;

    const [{items: poolNames}, setPoolNames] = React.useState<{
        items: Array<string>;
        itemsTree: string;
    }>({
        items: [],
        itemsTree: '',
    });

    const loadedPools = useLoadedPools(cluster, poolTree);

    React.useEffect(() => {
        loadedPools.then(({names, tree}) => {
            const noRoot = _.filter(names, (item) => '<Root>' !== item);
            const valueIndex = _.indexOf(noRoot, value);
            if (value && -1 === valueIndex) {
                onChange('');
            }
            setPoolNames({items: _.sortBy(noRoot), itemsTree: tree});
            if (calculateValueOnPoolsLoaded) {
                onChange(calculateValueOnPoolsLoaded({loadedPoolNames: noRoot}));
            }
        });
    }, [loadedPools, setPoolNames, onChange]);

    const getItems = React.useCallback(
        (_items: unknown, filter?: string) => {
            if (!filter) {
                return poolNames;
            }
            const from = _.sortedIndexBy(poolNames, filter, (item) =>
                item.substring(0, filter.length),
            );
            const to = _.sortedLastIndexBy(poolNames, filter, (item) =>
                item.substring(0, filter.length),
            );

            const res = _.slice(poolNames, from, to);
            return res;
        },
        [poolNames, value],
    );

    return (
        <Suggest
            popupClassName={block('popup')}
            text={value}
            filter={getItems}
            apply={(v) => allowEphemeral && onChange(typeof v === 'string' ? v : v.value)}
            onItemClick={(v) => onChange(typeof v === 'string' ? v : v.value)}
            onTextUpdate={allowEmpty ? (text) => !text && onChange('') : undefined}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}

PoolSuggestControl.getDefaultValue = () => {
    return '';
};

PoolSuggestControl.isEmpty = (value: Props['value']) => {
    return !value;
};

function useLoadedPools(
    cluster?: string,
    poolTree = '',
): Promise<{names: Array<string>; tree: string}> {
    return React.useMemo(() => {
        if (cluster) {
            return wrapApiPromiseByToaster(
                axios.get(`/api/pool-names/${cluster}?poolTree=${poolTree}`),
                {
                    skipSuccessToast: true,
                    toasterName: 'load-pool-names',
                    errorTitle: 'Failed to load pools',
                },
            ).then(({data}) => {
                return data;
            });
        } else {
            return wrapApiPromiseByToaster(
                ytApiV3Id.list(YTApiId.listPoolNames, {
                    path: `//sys/scheduler/orchid/scheduler/pool_trees/${poolTree}/pools`,
                    ...USE_MAX_SIZE,
                }),
                {
                    skipSuccessToast: true,
                    toasterName: 'load-pool-names',
                    errorTitle: 'Failed to load pools',
                },
            ).then((names) => {
                return {names: ypath.getValue(names), tree: poolTree};
            });
        }
    }, [cluster, poolTree]);
}
