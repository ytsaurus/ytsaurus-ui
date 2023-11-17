import React from 'react';
import {useDispatch} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';
import Icon from '../../../components/Icon/Icon';
import {chytListAction} from '../../../store/actions/chyt/list';
import {showErrorPopup} from '../../../utils/utils';

import {ChytConfirmation} from '../ChytConfirmation/ChytConfirmation';

import './ChytCliqueActions.scss';

const block = cn('chyt-clique-actions');

export function ChytCliqueActions({
    alias,
    showAllButtons,
    allButtonsClassName,
    onAction,
}: {
    showAllButtons?: boolean;
    allButtonsClassName?: string;
    alias: string;
    onAction?: (action: 'remove' | 'start') => void;
}) {
    const dispatch = useDispatch();
    const [visibleConfirmation, setVisibleConirmation] = React.useState<
        undefined | 'remove' | 'start'
    >();

    const start = {
        icon: <Icon awesome="play-circle" />,
        text: 'Start',
        action: () => {
            //dispatch(chytListAction('start', {alias}));
            setVisibleConirmation('start');
        },
    };
    const stop = {
        icon: <Icon awesome="stop-circle" />,
        text: 'Stop',
        action: () => {
            dispatch(chytListAction('stop', {alias}));
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
        <Button view="flat" onClick={() => showErrorPopup(new Error('not implemented'))}>
            <Icon awesome="sql" />
        </Button>
    );

    return (
        <React.Fragment>
            <ChytConfirmation
                alias={alias}
                action={visibleConfirmation}
                onClose={() => setVisibleConirmation(undefined)}
                onAction={onAction}
            />
            {showAllButtons ? (
                <span className={block('chyt-clique-actions', allButtonsClassName)}>
                    <span className={block('item')}>{sqlButton}</span>

                    <span className={block('item')}>
                        <Button
                            title="Start"
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
                            onClick={() => {
                                stop.action();
                            }}
                        >
                            <Icon awesome="stop-circle" />
                        </Button>
                    </span>

                    <Button
                        title="Remove"
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
                            <Button view="flat">
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
