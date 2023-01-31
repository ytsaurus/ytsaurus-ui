import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import {TextInput} from '@gravity-ui/uikit';
import key from 'hotkeys-js';

import Hotkey from '../../components/Hotkey/Hotkey';

const supportedSizes = ['xs', 's', 'm'];

const propTypes = {
    size: PropTypes.oneOf(supportedSizes),
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onApply: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    scope: PropTypes.string.isRequired,
    cancelOnBlur: PropTypes.bool,
};

const defaultProps = {
    size: 'm',
};

export default class Editor extends React.Component {
    constructor(props) {
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
    willReceiveProps({value}) {
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
    onChange(value) {
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
    render() {
        // console.log('<props>', this.props, '</props>');

        const {size, scope, placeholder} = this.props;

        return (
            <div className={block('elements-editor')()}>
                <TextInput
                    size={size}
                    placeholder={placeholder}
                    value={this.state.value}
                    autoFocus
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onUpdate={this.onChange}
                />
                <Hotkey
                    settings={[
                        {keys: 'enter', scope: scope, handler: this.onApply},
                        {keys: 'esc', scope: scope, handler: this.onCancel},
                    ]}
                />
            </div>
        );
    }
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
