import React, {Component} from 'react';

import map_ from 'lodash/map';

import hammer from '../../../common/hammer';
import Select, {YTSelectProps} from '../../../components/Select/Select';

type StateItem = string | {name: string; caption?: string};

interface Props extends Omit<YTSelectProps, 'items' | 'onUpdate' | 'value' | 'placeholder'> {
    // from props
    name: string;
    label?: string;
    withCounters?: boolean;
    multiple?: boolean;
    placeholder?: string | ((value: Props['value']) => string);
    // from connect
    updateFilter: (name: string, value: string | string[] | undefined) => void;
    states?: Array<StateItem>;
    value?: string | string[];
    counters?: Record<string, number>;
}

export default class OperationSelectFilter extends Component<Props> {
    static defaultProps = {
        withCounters: true,
    };

    get items() {
        const {value, states, counters, withCounters} = this.props;

        let found = false;
        const res = map_(states, (state) => {
            const stateName = typeof state === 'string' ? state : state.name;
            const count = counters && (counters[stateName] || 0);

            if (stateName === value) {
                found = true;
            }

            return {
                value: stateName,
                text:
                    (typeof state !== 'string' && state.caption) ||
                    hammer.format['ReadableField'](stateName),
                count: withCounters ? count : undefined,
            };
        });

        if ('string' === typeof value && !found) {
            res.push({
                value,
                text: hammer.format.ReadableField(value),
                count: undefined,
            });
        }

        return res;
    }

    render() {
        const {name, label, value = [], placeholder, multiple, ...props} = this.props;

        const placeHolder = 'function' === typeof placeholder ? placeholder(value) : placeholder;

        return (
            <Select
                hideFilter={true}
                label={label ?? hammer.format['FirstUppercase'](name) + ':'}
                {...props}
                placeholder={placeHolder}
                value={Array.isArray(value) ? value : [value]}
                items={this.items}
                onUpdate={(value) => {
                    const v = multiple ? value : value[0];
                    this.props.updateFilter(this.props.name, v);
                }}
            />
        );
    }
}
