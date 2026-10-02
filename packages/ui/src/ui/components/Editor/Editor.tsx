import React from 'react';
import block from 'bem-cn-lite';
import {TextInput} from '@gravity-ui/uikit';
import key from 'hotkeys-js';

import {Hotkey} from '@ytsaurus/components';

export type EditorProps = {
    size?: 'xs' | 's' | 'm';
    value?: string;
    placeholder?: string;
    onApply: {apply(value: string | undefined): void}['apply'];
    onCancel: () => void;
    scope: string;
    cancelOnBlur?: boolean;
    visible?: boolean;
};

const defaultProps = {
    size: 'm' as const,
};

export default class Editor extends React.Component<EditorProps, {value: string | undefined}> {
    static defaultProps = defaultProps;

    constructor(props: EditorProps) {
        super(props);

        this.onApply = this.onApply.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.state = {
            value: props.value,
        };
    }
    willReceiveProps({value}: Pick<EditorProps, 'value'>) {
        this.setState({value});
    }
    onApply() {
        if (typeof this.props.onApply === 'function') {
            this.props.onApply(this.state.value);
        }
    }
    onCancel() {
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }
    onChange(value: string) {
        this.setState({value});
    }
    onFocus() {
        key.setScope(this.props.scope);
    }
    onBlur() {
        key.setScope('all');
        const {cancelOnBlur} = this.props;
        if (cancelOnBlur) {
            this.onCancel();
        }
    }
    override render() {
        // console.log('<props>', this.props, '</props>');

        const {size, scope, placeholder} = this.props;

        return (
            <div className={block('elements-editor')()}>
                <TextInput
                    size={size as React.ComponentProps<typeof TextInput>['size']}
                    placeholder={placeholder}
                    value={this.state.value}
                    autoFocus
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onUpdate={this.onChange}
                />
                <Hotkey
                    settings={[
                        {keys: 'enter', scope, handler: this.onApply},
                        {keys: 'esc', scope, handler: this.onCancel},
                    ]}
                />
            </div>
        );
    }
}
