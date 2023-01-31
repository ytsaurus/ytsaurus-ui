import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {TextInput} from '@gravity-ui/uikit';

import Icon from '../Icon/Icon';
import Hotkey from '../../components/Hotkey/Hotkey';

import './Pagination.scss';
import Button from '../Button/Button';

const paginationControlComponent = PropTypes.shape({
    handler: PropTypes.func,
    target: PropTypes.func,
    disabled: PropTypes.bool,
    hotkey: PropTypes.string,
    hotkeyScope: PropTypes.string,
    hotkeyHandler: PropTypes.func,
}).isRequired;

const supportedSizes = ['s', 'm', 'l'];
const block = cn('elements-pagination');

export default class Pagination extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        size: PropTypes.oneOf(supportedSizes),
        first: paginationControlComponent,
        previous: paginationControlComponent,
        next: paginationControlComponent,
        last: paginationControlComponent,
        tooltip: PropTypes.string,
        showInput: PropTypes.bool,
        inputValue: PropTypes.string,
        onChange: PropTypes.func,
    };
    static defaultProps = {
        size: 'm',
        showInput: false,
    };

    renderComponent(name, control) {
        const handler = control.handler;

        const disabled = typeof control.disabled === 'boolean' ? control.disabled : false;

        const {size, tooltip} = this.props;
        const hotkeySettings = [
            {
                keys: control.hotkey,
                scope: control.hotkeyScope,
                handler: control.hotkeyHandler,
            },
        ];

        return (
            <span title={tooltip}>
                <Button
                    size={size}
                    onClick={handler}
                    disabled={disabled}
                    className={block('control', {name})}
                    title={
                        {
                            first: 'First page',
                            previous: 'Previous page',
                            next: 'Next page',
                            last: 'Last page',
                        }[name]
                    }
                    pin={
                        {
                            first: 'round-brick',
                            previous: 'clear-brick',
                            next: 'brick-clear',
                            last: 'brick-round',
                        }[name]
                    }
                >
                    <Icon
                        awesome={
                            {
                                first: 'angle-double-left',
                                previous: 'angle-left',
                                next: 'angle-right',
                                last: 'angle-double-right',
                            }[name]
                        }
                    />
                </Button>
                {typeof control.hotkeyHandler !== 'undefined' && (
                    <Hotkey settings={hotkeySettings} />
                )}
            </span>
        );
    }
    renderInput() {
        const {showInput, inputValue, onChange, size} = this.props;

        return showInput ? (
            <TextInput
                size={size}
                type="text"
                value={inputValue}
                onUpdate={onChange}
                pin={'clear-clear'}
            />
        ) : null;
    }
    render() {
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
