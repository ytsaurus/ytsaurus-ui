import React from 'react';
import PropTypes from 'prop-types';
import {TextInput} from '@gravity-ui/uikit';

export class EnterInput extends React.Component {
    static propTypes = {
        autoselect: PropTypes.bool,
        onCancel: PropTypes.func,
        onDone: PropTypes.func,
        onUpdate: PropTypes.func,
        size: PropTypes.string,
    };
    state = {};
    static getDerivedStateFromProps(props, state) {
        const {text} = props;
        if (state.previousText === text) {
            return state;
        } else {
            return {
                text,
                previousText: props.text,
            };
        }
    }
    componentDidMount() {
        if (this.props.autoselect) {
            this.focus();
            this.select();
        }
    }
    focus() {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }
    select() {
        if (this.inputRef.current) {
            this.inputRef.current.select();
        }
    }
    inputRef = React.createRef();
    onKeyDown = (event) => {
        switch (event.key) {
            case 'Enter':
                this.props.onDone(this.state.text);
                break;
            case 'Escape': {
                this.props.onCancel();
            }
        }
    };
    onBlur = () => {
        this.props.onCancel();
    };
    onUpdate = (text) => {
        this.setState({text});
        if (this.props.onUpdate) {
            this.props.onUpdate(text);
        }
    };
    render() {
        const {size, placeholder, autoFocus} = this.props; // eslint-disable-line no-unused-vars
        return (
            <TextInput
                controlRef={this.inputRef}
                size={size}
                placeholder={placeholder}
                value={this.state.text}
                autoFocus={autoFocus}
                onUpdate={this.onUpdate}
                onBlur={this.onBlur}
                onKeyDown={this.onKeyDown}
            />
        );
    }
}
