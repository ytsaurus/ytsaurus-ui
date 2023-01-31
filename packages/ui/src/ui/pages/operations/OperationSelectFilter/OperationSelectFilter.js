import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import hammer from '../../../common/hammer';
import Select from '../../../components/Select/Select';
import {itemsProps} from '../../../components/Suggest/Suggest';

export default class OperationSelectFilter extends Component {
    static propTypes = {
        // from props
        name: PropTypes.string.isRequired,
        withCounters: PropTypes.bool,
        type: PropTypes.string,
        // from connect
        updateFilter: PropTypes.func.isRequired,
        states: itemsProps,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        counters: PropTypes.object,
    };

    static defaultProps = {
        withCounters: true,
        type: 'radio',
    };

    get items() {
        const {value, states, counters, withCounters} = this.props;

        let found = false;
        const res = _.map(states, (state) => {
            const stateName = typeof state === 'string' ? state : state.name;
            const count = counters && (counters[stateName] || 0);

            if (stateName === value) {
                found = true;
            }

            return {
                value: stateName,
                text: state.caption || hammer.format['ReadableField'](stateName),
                count: withCounters ? count : undefined,
            };
        });

        if ('string' === typeof value && !found) {
            res.push({
                value,
                text: hammer.format.ReadableField(value),
            });
        }

        return res;
    }

    onRadioChange = (val) => this.props.updateFilter(this.props.name, val);
    onCheckChange = (val) => this.props.updateFilter(this.props.name, val);

    render() {
        const {name, value, type, placeholder, ...props} = this.props;
        const {multiple} = this.props;

        const placeHolder = 'function' === typeof placeholder ? placeholder(value) : placeholder;

        const onChange = type === 'radio' ? this.onRadioChange : this.onCheckChange;

        return (
            <Select
                {...props}
                placeholder={placeHolder}
                value={Array.isArray(value) ? value : [value]}
                type={type}
                items={this.items}
                onUpdate={(vals) => onChange(multiple ? vals : vals[0])}
                label={hammer.format['FirstUppercase'](name) + ':'}
                hideFilter={true}
            />
        );
    }
}
