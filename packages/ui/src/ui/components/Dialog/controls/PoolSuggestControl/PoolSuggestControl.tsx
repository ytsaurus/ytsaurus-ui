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
import {useDefaultPoolTree} from '../../../../hooks/global-pool-trees';

import './PoolSuggestControl.scss';

import i18n from './i18n';

const block = cn('pool-suggest-control');

type Props = DialogControlProps<string> & {
    // If not defined then current cluster should be used
    cluster?: string;
    // If not defined then default pool tree should be used
    poolTrees?: string[];
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
        poolTrees,
        cluster,
        calculateValueOnPoolsLoaded,
        disabled,
    } = props;

    const [poolNames, setPoolNames] = React.useState<Array<string>>([]);

    const names = useLoadedPools(cluster, poolTrees);

    React.useEffect(
        function onPoolLoaded() {
            if (!names) {
                return;
            }
            const noRoot = filter_(names, (item) => '<Root>' !== item);
            const valueIndex = indexOf_(noRoot, value);
            if (value && -1 === valueIndex) {
                onChange('');
            }
            setPoolNames(sortBy_(noRoot));
            if (calculateValueOnPoolsLoaded) {
                onChange(calculateValueOnPoolsLoaded({loadedPoolNames: noRoot}));
            }
        },
        // value should not affect the useEffect
        [names && names.join(), setPoolNames, onChange, calculateValueOnPoolsLoaded /*, value */],
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

function useLoadedPools(cluster?: string, poolTrees?: string[]): Array<string> | null {
    poolTrees = poolTrees || [];

    const [poolNames, setPoolNames] = React.useState<Array<string> | null>(null);

    const defaultPoolTree = useDefaultPoolTree();

    React.useMemo(() => {
        const localPoolTrees: string[] = poolTrees.length
            ? poolTrees
            : defaultPoolTree
              ? [defaultPoolTree]
              : [];

        if (!localPoolTrees.length) {
            return;
        }

        let promise: Promise<string[]>;

        if (cluster) {
            promise = fetchPoolNamesByCluster(cluster, localPoolTrees);
        } else {
            promise = fetchPoolNamesByPoolTrees(localPoolTrees);
        }

        return wrapApiPromiseByToaster(promise, {
            skipSuccessToast: true,
            toasterName: 'load-pool-names',
            errorTitle: i18n('alert_failed-load-pools'),
        }).then((result) => {
            setPoolNames(result);
        });
    }, [cluster, defaultPoolTree, poolTrees.join()]);

    return poolNames;
}

function fetchPoolNamesByCluster(cluster: string, poolTrees: string[]): Promise<string[]> {
    const promises = Promise.all(
        poolTrees.map((poolTree) => {
            return axios.get(`/api/pool-names/${cluster}?poolTree=${poolTree}`);
        }),
    );

    return promises.then((results) => {
        const namesMap: Record<string, boolean> = {};

        for (const result of results) {
            for (const poolName of result.data.names) {
                namesMap[poolName] = true;
            }
        }

        return Object.keys(namesMap);
    });
}

function fetchPoolNamesByPoolTrees(poolTrees: string[]): Promise<string[]> {
    const promises = Promise.all(
        poolTrees.map((poolTree) => {
            return ytApiV3Id.list(YTApiId.listPoolNames, {
                path: `//sys/scheduler/orchid/scheduler/pool_trees/${poolTree}/pools`,
                ...USE_MAX_SIZE,
            });
        }),
    );

    return promises.then((results) => {
        const namesMap: Record<string, boolean> = {};

        for (const result of results) {
            for (const poolName of ypath.getValue(result)) {
                namesMap[poolName] = true;
            }
        }

        return Object.keys(namesMap);
    });
}
