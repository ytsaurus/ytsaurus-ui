import React from 'react';
import {useDispatch} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import ArrowsRotateRightIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';
import {Button, DropdownMenu, type DropdownMenuItem, Icon as GravityIcon} from '@gravity-ui/uikit';

import Icon from '../../../components/Icon/Icon';
import {useClusterFromLocation} from '../../../hooks/use-cluster';
import {updateQueryDraft} from '../../../store/actions/query-tracker/query';
import {QueryEngine} from '../../../../shared/constants/engines';
import UIFactory from '../../../UIFactory';

import {type StrawberryCliqueStateType} from '../../../utils/strawberryControllerApi';
import {type ChytRestartCapability} from './use-chyt-restart-capability';
import {ChytConfirmation, type ChytConfirmationProps} from '../ChytConfirmation/ChytConfirmation';

import './ChytCliqueActions.scss';

import i18n from './i18n';

const block = cn('chyt-clique-actions');

export function useCliqueOnSqlAction(openWidget: () => void) {
    const cluster = useClusterFromLocation();
    const dispatch = useDispatch();

    return React.useCallback(
        (alias: string) => {
            if (!UIFactory.onChytAliasSqlClick) {
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
        [cluster, openWidget, dispatch],
    );
}

export function ChytCliqueActions({
    alias,
    pool,
    state,
    restartCapability,
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
    state?: StrawberryCliqueStateType;
    restartCapability?: ChytRestartCapability;
    onSqlClick: (alias: string) => void;
    onAction?: ChytConfirmationProps['onAction'];
    color?: 'secondary';
}) {
    const [visibleConfirmation, setVisibleConirmation] = React.useState<
        ChytConfirmationProps['action'] | undefined
    >();

    const start = {
        icon: <Icon awesome="play-circle" />,
        text: i18n('action_start'),
        action: () => {
            setVisibleConirmation('start');
        },
    };
    const stop = {
        icon: <Icon awesome="stop-circle" />,
        text: i18n('action_stop'),
        action: () => {
            setVisibleConirmation('stop');
        },
    };
    const remove = {
        icon: <Icon awesome="trash-alt" />,
        text: i18n('action_remove'),
        action: () => {
            setVisibleConirmation('remove');
        },
    };

    const canRestart = Boolean(restartCapability && (state === 'active' || state === 'untracked'));
    const restart = {
        icon: <GravityIcon data={ArrowsRotateRightIcon} size="1em" />,
        text: i18n('action_restart'),
        action: () => setVisibleConirmation('restart'),
    };
    const menuItems: Array<Array<DropdownMenuItem>> = [
        [start, stop, ...(canRestart ? [restart] : [])],
        [remove],
    ];

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
                    allowForceRestart={state === 'untracked' && restartCapability?.force}
                    onClose={() => setVisibleConirmation(undefined)}
                    onAction={onAction}
                />
            )}
            {showAllButtons ? (
                <span className={block('chyt-clique-actions', allButtonsClassName)}>
                    <span className={block('item')}>{sqlButton}</span>

                    <span className={block('item')}>
                        <Button
                            title={i18n('action_start')}
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
                            title={i18n('action_stop')}
                            view="outlined"
                            onClick={() => {
                                stop.action();
                            }}
                        >
                            <Icon awesome="stop-circle" />
                        </Button>
                    </span>

                    {canRestart && (
                        <span className={block('item')}>
                            <Button title={restart.text} view="outlined" onClick={restart.action}>
                                {restart.icon}
                            </Button>
                        </span>
                    )}

                    <Button
                        title={i18n('action_remove')}
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
                        renderSwitcher={(props) => (
                            <Button
                                {...props}
                                view={color === 'secondary' ? 'flat-secondary' : 'flat'}
                            >
                                <Icon awesome="ellipsis-h" />
                            </Button>
                        )}
                        items={menuItems}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}
