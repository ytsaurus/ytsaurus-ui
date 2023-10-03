import React from 'react';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import cn from 'bem-cn-lite';

import {Button, Select, SelectOption, SelectProps, Text, TextInput} from '@gravity-ui/uikit';

import {Chevron} from '../../icons/Chevron';
import hammer from '../../common/hammer';

import './Select.scss';

const block = cn('yt-select');

export interface YTSelectProps extends Omit<SelectProps, 'options' | 'filter' | 'onChange'> {
    className?: string;
    items: Array<Item>;
    maxVisibleValues?: number;
    hideClear?: boolean;
    hideFilter?: boolean;
    onChange?: (v: Required<YTSelectProps>['value']) => void;

    renderItem?: (item: Item, useNoValue?: boolean) => React.ReactNode;
}

export interface Item {
    value: string;
    text?: React.ReactNode;
    count?: number;
    icon?: React.ReactNode;
}

const emptyValue: Array<string> = [];

export default function SelectFacade(props: YTSelectProps) {
    const {items, onUpdate, onChange, value, ...rest} = props;
    const {options, hashByValue} = React.useMemo(() => {
        return prepareItems(items);
    }, [items]);

    const handleChange = React.useCallback(
        (value: Required<YTSelectProps>['value']) => {
            onChange?.(value);
            onUpdate?.(value);
        },
        [onChange, onUpdate],
    );

    const filteredValue = React.useMemo(() => {
        const res = _filter(value, Boolean);
        return res.length ? res : emptyValue;
    }, [value]);

    return (
        <CustomSelect
            onUpdate={handleChange}
            {...rest}
            {...{value: filteredValue, options, hashByValue}}
        />
    );
}

SelectFacade.isEmpty = (value: YTSelectProps['value']) => {
    return !value?.length || (value.length === 1 && !value[0]);
};

SelectFacade.getDefaultValue = () => {
    return undefined;
};

interface SelectSingleProps extends Omit<YTSelectProps, 'value' | 'onUpdate' | 'onChange'> {
    value?: string;
    onChange?: (v?: string) => void;
}

export function SelectSingle(props: SelectSingleProps) {
    const {onChange, value, ...rest} = props;
    const handleChange = React.useCallback(
        (vals?: Array<string>) => {
            onChange?.(vals?.[0]);
        },
        [onChange],
    );

    return (
        <SelectFacade
            value={value !== undefined ? [value] : undefined}
            onChange={handleChange}
            {...rest}
        />
    );
}

SelectSingle.isEmpty = (value: SelectSingleProps['value']) => {
    return !value;
};

SelectSingle.getDefaultValue = () => {
    return undefined;
};

function prepareItems(items: YTSelectProps['items']) {
    const hashByValue: Map<string, SelectOption> = new Map();
    const options = items.map((item) => {
        const {value} = item;
        const res = {
            value,
            data: item,
        };
        hashByValue.set(value, res);
        return res;
    });
    return {options, hashByValue};
}

function renderItemContent(item: Item, useNoValue = false) {
    const {value, text, icon} = item;
    const content = text || (value ? hammer.format['ReadableField'](value) : undefined);
    const empty = !content;
    return (
        <>
            {icon && <span className={block('item-icon')}>{icon}</span>}
            {empty ? (
                <Text className={block('empty')} color={'secondary'}>
                    {useNoValue ? hammer.format.NO_VALUE : 'Empty string'}
                </Text>
            ) : (
                content
            )}
        </>
    );
}

class CustomSelect extends React.Component<
    SelectProps &
        Pick<ValueControlProps, 'hashByValue' | 'maxVisibleValues'> &
        Pick<YTSelectProps, 'hideClear' | 'hideFilter' | 'renderItem'>
> {
    static defaultProps = {
        width: 'max',
    };

    render() {
        const {className, hideFilter, ...props} = this.props;
        return (
            <Select
                className={block(null, className)}
                {...props}
                filterable={!hideFilter}
                renderOption={this.renderOption}
                renderControl={this.renderControl}
                renderFilter={this.renderFilter}
                disablePortal
            />
        );
    }

    renderControl: SelectProps['renderControl'] = ({ref, ...props}) => {
        const {
            value,
            className,
            label,
            pin,
            placeholder,
            disabled,
            width,
            hashByValue,
            maxVisibleValues,
        } = this.props;
        return (
            <ValueControl
                controlRef={ref}
                renderItem={this.renderItem}
                {...props}
                {...{
                    className,
                    value,
                    placeholder,
                    hashByValue,
                    label,
                    width,
                    pin,
                    disabled,
                    maxVisibleValues,
                }}
            />
        );
    };

    renderItem = (item: Item, useNoValue?: boolean) => {
        const {renderItem} = this.props;
        return renderItem ? renderItem(item, useNoValue) : renderItemContent(item, useNoValue);
    };

    renderOption = (option: SelectOption) => {
        const {data: item} = option;
        const {count} = item as Item;

        const content = this.renderItem(item);

        const meta = typeof count === 'number' ? String(count) : undefined;

        const text = <Text className={block('item-text')}>{content}</Text>;

        if (meta) {
            return (
                <>
                    {text}
                    <Text ellipsis className={block('item-count')} color="secondary">
                        {' '}
                        {count}
                    </Text>
                </>
            );
        }

        return text;
    };

    renderFilter: SelectProps['renderFilter'] = ({ref, onChange, ...props}) => {
        const {hideClear, value} = this.props;
        const filter = <TextInput controlRef={ref} onUpdate={onChange} {...props} />;
        if (hideClear || !value?.length) {
            return filter;
        }

        return (
            <div className={block('filter')}>
                {filter}
                <span className={block('filter-btn')}>
                    <Button view="flat-secondary" onClick={() => this.props.onUpdate?.([])}>
                        Clear
                    </Button>
                </span>
            </div>
        );
    };
}

type Extra = Parameters<Required<SelectProps>['renderControl']>[0];

interface ValueControlProps extends Omit<Extra, 'ref'> {
    controlRef: React.Ref<HTMLElement>;
    hashByValue: Map<string, SelectOption>;
    maxVisibleValues?: YTSelectProps['maxVisibleValues'];
    placeholder?: SelectProps['placeholder'];
    className?: string;
}

function ValueControl({
    className,
    value,
    label,
    onClick,
    hashByValue,
    controlRef,
    width,
    pin,
    disabled,
    maxVisibleValues,
    placeholder,
    renderItem,
}: ValueControlProps &
    Pick<SelectProps, 'value' | 'pin' | 'label' | 'width' | 'disabled'> &
    Pick<Required<YTSelectProps>, 'renderItem'>) {
    const options = _map(value, (v) => hashByValue.get(v));
    const {w, style} =
        typeof width !== 'number' ? {w: width, style: undefined} : {style: {width}, w: undefined};

    const visbileItems = options.slice(0, maxVisibleValues ?? 1);

    return (
        <Button
            className={block(null, className)}
            ref={controlRef as any}
            view="outlined"
            onClick={onClick}
            width={w}
            style={style}
            {...{pin, disabled}}
        >
            <span className={block('control-value')}>
                {label && <Text className={block('control-label')}>{label}</Text>}
                {!value?.length ? (
                    <Text color="hint">{placeholder ?? hammer.format.NO_VALUE}</Text>
                ) : (
                    _map(visbileItems, (option, index) => {
                        const content = option ? (
                            renderItem(option.data, true)
                        ) : (
                            <Text color="secondary">
                                {renderItem({value: value[index]!}, true)}
                            </Text>
                        );
                        return (
                            <span key={index} className={block('control-value-item')}>
                                {index !== 0 && <>,&nbsp;</>}
                                {content}
                            </span>
                        );
                    })
                )}
            </span>
            <span className={block('spacer')}>
                {options.length > visbileItems.length && ', ...'}
            </span>
            <SelectedCount value={options.length} />
            <Chevron className={block('chevron')} />
        </Button>
    );
}

function SelectedCount({value}: {value?: number}) {
    return value! >= 2 ? (
        <div className={block('counter')}>
            <span className={block('counter-value')}>{value}</span>
        </div>
    ) : null;
}
