import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';

import Icon from '../../../components/Icon/Icon';
import {getCluster} from '../../../store/selectors/global';
import {isQueryTrackerAllowed} from '../../../store/selectors/global/experimental-pages';
import {updateQueryDraft} from '../../../pages/query-tracker/module/query/actions';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';
import UIFactory from '../../../UIFactory';

import {ChytConfirmation} from '../ChytConfirmation/ChytConfirmation';

import './ChytCliqueActions.scss';

const block = cn('chyt-clique-actions');

export function useCliqueOnSqlAction(openWidget: () => void) {
    const cluster = useSelector(getCluster);
    const allowQueryTracker = useSelector(isQueryTrackerAllowed);
    const dispatch = useDispatch();

    return React.useCallback(
        (alias: string) => {
            if (allowQueryTracker) {
                setTimeout(() => {
                    dispatch(
                        updateQueryDraft({
                            engine: QueryEngine.CHYT,
                            query: `SELECT 1;`,
                            settings: {cluster, clique: alias},
                        }),
                    );
                }, 500);
                openWidget();
            } else {
                UIFactory.onChytAliasSqlClick({alias, cluster});
            }
        },
        [cluster, openWidget, allowQueryTracker, dispatch],
    );
}

export function ChytCliqueActions({
    alias,
    pool,
    showAllButtons,
    allButtonsClassName,
    onAction,
    onSqlClick,
    color,
}: {
    showAllButtons?: boolean;
    allButtonsClassName?: string;
    alias: string;
    pool?: string;
    onSqlClick: (alias: string) => void;
    onAction?: (action: 'remove' | 'start' | 'stop') => void;
    color?: 'secondary';
}) {
    const [visibleConfirmation, setVisibleConirmation] = React.useState<
        undefined | 'remove' | 'start' | 'stop'
    >();

    const start = {
        icon: <Icon awesome="play-circle" />,
        text: 'Start',
        action: () => {
            setVisibleConirmation('start');
        },
    };
    const stop = {
        icon: <Icon awesome="stop-circle" />,
        text: 'Stop',
        action: () => {
            setVisibleConirmation('stop');
        },
    };
    const remove = {
        icon: <Icon awesome="trash-alt" />,
        text: 'Remove',
        action: () => {
            setVisibleConirmation('remove');
        },
    };

    const menuItems: Array<Array<DropdownMenuItem>> = [[start, stop], [remove]];

    const sqlButton = (
        <Button
            view={color === 'secondary' ? 'flat-secondary' : 'flat'}
            onClick={() => onSqlClick(alias)}
        >
            <Icon awesome="sql" />
        </Button>
    );

    return (
        <React.Fragment>
            {visibleConfirmation !== undefined && (
                <ChytConfirmation
                    alias={alias}
                    pool={pool}
                    action={visibleConfirmation}
                    onClose={() => setVisibleConirmation(undefined)}
                    onAction={onAction}
                />
            )}
            {showAllButtons ? (
                <span className={block('chyt-clique-actions', allButtonsClassName)}>
                    <span className={block('item')}>{sqlButton}</span>

                    <span className={block('item')}>
                        <Button
                            title="Start"
                            view="outlined"
                            onClick={() => {
                                start.action();
                            }}
                        >
                            <Icon awesome="play-circle" />
                        </Button>
                    </span>

                    <span className={block('item')}>
                        <Button
                            title="Stop"
                            view="outlined"
                            onClick={() => {
                                stop.action();
                            }}
                        >
                            <Icon awesome="stop-circle" />
                        </Button>
                    </span>

                    <Button
                        title="Remove"
                        view="outlined"
                        onClick={() => {
                            remove.action();
                        }}
                    >
                        <Icon awesome="trash-alt" />
                    </Button>
                </span>
            ) : (
                <React.Fragment>
                    {sqlButton}
                    <DropdownMenu
                        switcher={
                            <Button view={color === 'secondary' ? 'flat-secondary' : 'flat'}>
                                <Icon awesome="ellipsis-h" />
                            </Button>
                        }
                        items={menuItems}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}
