import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import forEach_ from 'lodash/forEach';

import {getPoolsNames, getTree} from '../../../store/selectors/scheduling/scheduling';
import {changePool} from '../../../store/actions/scheduling/scheduling';
import {schedulingLoadFilterAttributes} from '../../../store/actions/scheduling/scheduling-ts';

import {ROOT_POOL_NAME} from '../../../constants/scheduling';
import Suggest from '../../../components/Suggest/Suggest';

import './PoolsSuggest.scss';

const block = cn('yt-pools-suggest');

export function PoolsSuggest({
    onCancelEdit = () => {},
    className,
    autoFocus,
}: {
    onCancelEdit?: () => void;
    className?: string;
    autoFocus?: boolean;
}) {
    const poolNames = useSelector(getPoolsNames);
    const tree = useSelector(getTree);
    const dispatch = useDispatch();

    const getSuggestItems = React.useCallback(
        (_items: any, filter?: string) => {
            if (!filter) {
                return poolNames;
            }

            const match: Array<string> = [];
            const startsWith: Array<string> = [];
            const filtered: Array<string> = [];

            const lcFilter = filter?.toLowerCase();

            forEach_(poolNames, (poolName) => {
                const lcPoolName = poolName.toLowerCase();
                if (lcFilter === lcPoolName) {
                    match.push(poolName);
                } else if (lcPoolName.startsWith(lcFilter)) {
                    startsWith.push(poolName);
                } else if (poolName !== ROOT_POOL_NAME && -1 !== lcPoolName.indexOf(lcFilter)) {
                    filtered.push(poolName);
                }
            });
            return match.concat(startsWith, filtered);
        },
        [poolNames],
    );

    const handleCancelEdit = React.useCallback(() => {
        setTimeout(onCancelEdit, 500);
    }, [onCancelEdit]);

    const onItemClick = React.useCallback(
        (pool: string) => {
            dispatch(changePool(pool));
            onCancelEdit();
        },
        [dispatch, onCancelEdit],
    );

    const onFocus = React.useCallback(() => {
        dispatch(schedulingLoadFilterAttributes(tree));
    }, [dispatch, tree]);

    return (
        <Suggest
            className={block(null, className)}
            popupClassName={block('popup')}
            autoFocus={autoFocus}
            filter={getSuggestItems}
            onBlur={handleCancelEdit}
            onFocus={onFocus}
            placeholder="Select pool..."
            onItemClick={(item) => onItemClick('string' === typeof item ? item : item.value)}
            items={poolNames}
        />
    );
}
