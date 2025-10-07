import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import {Select} from '@gravity-ui/uikit';

import './SelectWithSubItems.scss';

const block = cn('ic-select-with-subitems');

export interface Props {
    className?: string;
    value: Array<string>;
    onChange: (value: Props['value']) => void;
    items: Array<{value: string; content: string}>;
    subItemsMap?: Record<string, Props['items']>;
    labels?: Array<React.ReactNode>;
    labelClassName?: string;
    placeholder?: string;
    disablePortal?: boolean;
}

export type SelectWithSubItemsProps = Props;

export default class SelectWithSubItems extends Component<Props> {
    static getDefaultValue() {
        return [];
    }

    static isEmpty(value: Props['value']) {
        return !value || value.length === 0;
    }

    render() {
        const {className, value: input, items, labels, placeholder, subItemsMap = {}} = this.props;
        const [first, second] = input || [];
        const [label, subLabel] = labels || [];

        const subItems = subItemsMap[first];

        const subValue = second || (subItems && subItems[0].value);

        return (
            <div className={block(null, className)}>
                {this.renderSelect(first, items, this.onChange, label, placeholder)}
                {this.renderSelect(
                    subValue,
                    subItemsMap[first],
                    this.onSubValueChange,
                    subLabel,
                    undefined,
                )}
            </div>
        );
    }

    renderSelect(
        value: string,
        items: Props['items'],
        onChange: (value: string) => void,
        label: React.ReactNode,
        placeholder?: string,
    ) {
        if (!items || !items.length) {
            return null;
        }

        const {labelClassName, disablePortal = true} = this.props;

        return (
            <div className={block('control')}>
                {label && <span className={block('control-label', labelClassName)}>{label}</span>}
                <Select
                    options={items}
                    value={[value]}
                    onUpdate={(vals) => onChange(vals[0])}
                    placeholder={placeholder}
                    width="max"
                    disablePortal={disablePortal}
                />
            </div>
        );
    }

    onChange = (newValue: string) => {
        const {value: input, onChange, subItemsMap = {}} = this.props;
        const [oldValue, second] = input || [];
        const subItems = subItemsMap[newValue];

        if (oldValue === newValue) {
            return;
        }

        if (subItems) {
            const subValue = subItems.find(({value}) => value === second)
                ? second
                : subItems[0].value;
            onChange([newValue, subValue]);
        } else {
            onChange([newValue]);
        }
    };

    onSubValueChange = (newSubValue: string) => {
        const {value: input, onChange} = this.props;
        const [oldValue] = input || [];
        onChange([oldValue, newSubValue]);
    };
}
