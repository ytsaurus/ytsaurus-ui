import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import key from 'hotkeys-js';
import _ from 'lodash';

import {TextInput, TextInputProps} from '@gravity-ui/uikit';
import Hotkey from '../../components/Hotkey/Hotkey';

function NumberOrFalse(props: FilterProps, _propName: 'debounce', componentName: string) {
    const value = props.debounce;
    if (typeof value !== 'number') {
        return new Error(
            `Invalid prop 'debounce' supplied to ${componentName}'. It should be either number or false.`,
        );
    }
    return undefined;
}

const block = cn('elements-filter');

export interface FilterProps
    extends Partial<Pick<TextInputProps, 'type' | 'view' | 'pin' | 'disabled' | 'qa'>> {
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

export default class Filter extends Component<FilterProps, State> {
    static hotKeyPropType = PropTypes.arrayOf(
        PropTypes.shape({
            keys: PropTypes.string.isRequired,
            handler: PropTypes.func.isRequired,
            scope: PropTypes.string,
            preventDefault: PropTypes.bool,
        }),
    );

    static propTypes = {
        className: PropTypes.string,
        size: PropTypes.string,
        placeholder: PropTypes.string,
        autofocus: PropTypes.bool,
        value: PropTypes.string,
        debounce: NumberOrFalse,
        onChange: PropTypes.func,
        invalid: PropTypes.bool,

        hasClear: PropTypes.bool,
        externallyManaged: PropTypes.bool,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onEnterKeyDown: PropTypes.func,
        skipBlurByEnter: PropTypes.bool,
    };

    static defaultProps = {
        size: 'm',
        placeholder: 'Filter...',
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
        ? _.debounce(this.props.onChange, this.props.debounce)
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
            placeholder,
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
                    // NOTE: see https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                    // for howto forcibly update text wo calling onChange
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
