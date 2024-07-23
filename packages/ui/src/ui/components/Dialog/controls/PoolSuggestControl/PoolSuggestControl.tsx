import React from 'react';

import filter_ from 'lodash/filter';
import indexOf_ from 'lodash/indexOf';
import slice_ from 'lodash/slice';
import sortBy_ from 'lodash/sortBy';
import sortedIndexBy_ from 'lodash/sortedIndexBy';
import sortedLastIndexBy_ from 'lodash/sortedLastIndexBy';

import cn from 'bem-cn-lite';
import axios from 'axios';

import {USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';
import ypath from '../../../../common/thor/ypath';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import Suggest from '../../../../components/Suggest/Suggest';

import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {usePoolTreeOrLoadDefault} from '../../../../hooks/global-pool-trees';

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

    React.useEffect(
        function onPoolLoaded() {
            const {names, tree} = loadedPools;
            if (!tree) {
                return;
            }
            const noRoot = filter_(names, (item) => '<Root>' !== item);
            const valueIndex = indexOf_(noRoot, value);
            if (value && -1 === valueIndex) {
                onChange('');
            }
            setPoolNames({items: sortBy_(noRoot), itemsTree: tree});
            if (calculateValueOnPoolsLoaded) {
                onChange(calculateValueOnPoolsLoaded({loadedPoolNames: noRoot}));
            }
        },
        // value should not affect the useEffect
        [loadedPools, setPoolNames, onChange, calculateValueOnPoolsLoaded /*, value */],
    );

    const getItems = React.useCallback(
        (_items: unknown, filter?: string) => {
            if (!filter) {
                return poolNames;
            }
            const from = sortedIndexBy_(poolNames, filter, (item) =>
                item.substring(0, filter.length),
            );
            const to = sortedLastIndexBy_(poolNames, filter, (item) =>
                item.substring(0, filter.length),
            );

            const res = slice_(poolNames, from, to);
            return res;
        },
        [poolNames],
    );

    return (
        <Suggest
            popupClassName={block('popup')}
            text={value}
            filter={getItems}
            onItemClick={(v) => onChange(typeof v === 'string' ? v : v.value)}
            onTextUpdate={(text) => {
                if (allowEmpty && !text) {
                    onChange('');
                } else if (allowEphemeral) {
                    onChange(text);
                }
            }}
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

function useLoadedPools(cluster?: string, poolTree = ''): {names: Array<string>; tree?: string} {
    const [result, setResult] = React.useState<{names: Array<string>; tree?: string}>({names: []});

    const currentClusterTree = usePoolTreeOrLoadDefault(poolTree);

    React.useMemo(() => {
        if (cluster) {
            wrapApiPromiseByToaster(axios.get(`/api/pool-names/${cluster}?poolTree=${poolTree}`), {
                skipSuccessToast: true,
                toasterName: 'load-pool-names',
                errorTitle: 'Failed to load pools',
            }).then(({data}) => {
                setResult(data);
            });
        } else if (poolTree || currentClusterTree) {
            const localPoolTree = poolTree || currentClusterTree;
            wrapApiPromiseByToaster(
                ytApiV3Id.list(YTApiId.listPoolNames, {
                    path: `//sys/scheduler/orchid/scheduler/pool_trees/${localPoolTree}/pools`,
                    ...USE_MAX_SIZE,
                }),
                {
                    skipSuccessToast: true,
                    toasterName: 'load-pool-names',
                    errorTitle: 'Failed to load pools',
                },
            ).then((names) => {
                setResult({names: ypath.getValue(names), tree: localPoolTree});
            });
        }
    }, [cluster, currentClusterTree, poolTree]);

    return result;
}
