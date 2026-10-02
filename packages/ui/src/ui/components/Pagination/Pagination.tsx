import React from 'react';
import cn from 'bem-cn-lite';
import {TextInput} from '@gravity-ui/uikit';

import Icon from '../Icon/Icon';
import {Hotkey, type HotkeyProps} from '@ytsaurus/components';

import './Pagination.scss';
import Button, {type ButtonProps} from '../Button/Button';

import i18n from './i18n';

export type PaginationControl = {
    handler?: React.MouseEventHandler<HTMLButtonElement>;
    target?: () => void;
    disabled?: boolean;
    hotkey?: string;
    hotkeyScope?: string;
    hotkeyHandler?: HotkeyProps['settings'][number]['handler'];
};

export type PaginationProps = {
    className?: string;
    size?: 's' | 'm' | 'l';
    first: PaginationControl;
    previous: PaginationControl;
    next: PaginationControl;
    last: PaginationControl;
    tooltip?: string;
    showInput?: boolean;
    inputValue?: string;
    onChange?: (value: string) => void;
};
const block = cn('elements-pagination');

export default class Pagination extends React.Component<PaginationProps> {
    static defaultProps = {
        size: 'm' as const,
        showInput: false,
    };

    renderComponent(name: 'first' | 'previous' | 'next' | 'last', control: PaginationControl) {
        const handler = control.handler;

        const disabled = typeof control.disabled === 'boolean' ? control.disabled : false;

        const {size, tooltip} = this.props;
        return (
            <span title={tooltip}>
                <Button
                    size={size}
                    onClick={handler}
                    disabled={disabled}
                    className={block('control', {name})}
                    title={
                        {
                            first: i18n('action_first-page'),
                            previous: i18n('action_previous-page'),
                            next: i18n('action_next-page'),
                            last: i18n('action_last-page'),
                        }[name]
                    }
                    pin={
                        (
                            {
                                first: 'round-brick',
                                previous: 'clear-brick',
                                next: 'brick-clear',
                                last: 'brick-round',
                            } satisfies Record<typeof name, ButtonProps['pin']>
                        )[name]
                    }
                >
                    <Icon
                        awesome={
                            (
                                {
                                    first: 'angle-double-left',
                                    previous: 'angle-left',
                                    next: 'angle-right',
                                    last: 'angle-double-right',
                                } satisfies Record<
                                    typeof name,
                                    React.ComponentProps<typeof Icon>['awesome']
                                >
                            )[name]
                        }
                        size={13}
                    />
                </Button>
                {control.hotkey && control.hotkeyScope && control.hotkeyHandler && (
                    <Hotkey
                        settings={[
                            {
                                keys: control.hotkey,
                                scope: control.hotkeyScope,
                                handler: control.hotkeyHandler,
                            },
                        ]}
                    />
                )}
            </span>
        );
    }
    renderInput() {
        const {showInput, inputValue, onChange, size} = this.props;

        return showInput ? (
            <TextInput
                qa="yt-pagination_input"
                size={size}
                type="text"
                value={inputValue}
                onUpdate={onChange}
                pin={'clear-clear'}
            />
        ) : null;
    }
    override render() {
        const {first, previous, next, last, className} = this.props;

        return (
            <div className={block(null, className)}>
                {this.renderComponent('first', first)}
                {this.renderComponent('previous', previous)}
                {this.renderInput()}
                {this.renderComponent('next', next)}
                {this.renderComponent('last', last)}
            </div>
        );
    }
}
