import React, {Component} from 'react';
import cn from 'bem-cn-lite';
import key from 'hotkeys-js';
import i18n from './i18n';

import debounce_ from 'lodash/debounce';

import {TextInput, TextInputProps} from '@gravity-ui/uikit';
import {Hotkey} from '../Hotkey';

const block = cn('elements-filter');

export interface FilterProps extends Partial<
    Pick<TextInputProps, 'type' | 'view' | 'pin' | 'disabled' | 'qa'>
> {
    className?: string;

    value: string;
    onChange: (value: FilterProps['value']) => void;

    size?: TextInputProps['size'];
    placeholder?: string;
    autofocus?: boolean;
    debounce?: number;
    invalid?: boolean;

    hotkey?: {
        keys: string;
        handler: () => void;
        scope?: string;
        preventDefault?: boolean;
    };

    hasClear?: boolean;
    externallyManaged?: boolean;

    onFocus?: (value: FilterProps['value']) => void;
    onBlur?: (value: FilterProps['value']) => void;
    onEnterKeyDown?: (value: FilterProps['value'], e: React.KeyboardEvent) => void;

    skipBlurByEnter?: boolean;
}

interface State {
    value: FilterProps['value'];
}

export class Filter extends Component<FilterProps, State> {
    static defaultProps: Partial<FilterProps> = {
        size: 'm',
        autofocus: true,
        debounce: 200,
        invalid: false,
        hasClear: true,
        externallyManaged: false,
        onChange: () => {},
        onFocus: () => {},
        onBlur: () => {},
        onEnterKeyDown: () => {},
    };

    static getDerivedStateFromProps(props: FilterProps) {
        return props.externallyManaged ? {value: props.value} : null;
    }

    state: State = {value: this.props.value};
    prevScope = key.getScope();

    input: HTMLInputElement | HTMLTextAreaElement | null = null;

    focus = () => this.input?.focus();
    blur = () => this.input?.blur();

    onFocus = () => {
        const {value} = this.state;

        key.setScope('filter');
        this.props.onFocus!(value);
    };
    onBlur = () => {
        const {value} = this.state;

        key.setScope(this.prevScope);
        this.props.onBlur!(value);
    };

    // eslint-disable-next-line @typescript-eslint/member-ordering
    debouncedOnChange = this.props.debounce
        ? debounce_(this.props.onChange, this.props.debounce)
        : this.props.onChange;

    onChange = (value: FilterProps['value']) => {
        this.setState({value});
        this.debouncedOnChange(value);
    };

    onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.props.onEnterKeyDown!(this.state.value, e);
        }
    };

    render() {
        const {
            className,
            size,
            placeholder = i18n('placeholder'),
            autofocus,
            hotkey,
            invalid,
            hasClear,
            skipBlurByEnter,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onChange,
            ...rest
        } = this.props;
        let hotkeySettings = [
            {keys: 'esc', handler: this.blur, scope: 'filter'},
            ...(!skipBlurByEnter ? [{keys: 'enter', handler: this.blur, scope: 'filter'}] : []),
            {keys: '/, ctrl+f, command+f', handler: this.focus, scope: 'all'},
        ].filter(Boolean);
        if (Array.isArray(hotkey)) {
            hotkeySettings = hotkey.concat(hotkeySettings);
        }

        return (
            <div className={block({invalid}, className)}>
                <TextInput
                    {...rest}
                    controlRef={(input) => {
                        this.input = input;
                    }}
                    type="text"
                    hasClear={hasClear}
                    autoComplete={false}
                    size={size}
                    onUpdate={this.onChange}
                    value={this.state.value}
                    placeholder={placeholder}
                    autoFocus={autofocus}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                />
                <Hotkey settings={hotkeySettings} />
            </div>
        );
    }
}
