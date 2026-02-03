import React from 'react';
import filter_ from 'lodash/filter';
import cn from 'bem-cn-lite';

import {
    Button,
    Select,
    SelectOption,
    SelectProps,
    SelectRenderControlProps,
    Text,
    TextInput,
} from '@gravity-ui/uikit';

import {Chevron} from '../../icons/Chevron';
import hammer from '../../common/hammer';

import {VisibleValues} from '../../components/VisibleValues/VisibleValues';

import './Select.scss';

const block = cn('yt-select');

export interface YTSelectProps<T extends string = string>
    extends Omit<SelectProps, 'options' | 'filter' | 'onChange' | 'onUpdate' | 'value'> {
    className?: string;
    value?: Array<T>;
    items: Array<Item<T>>;
    maxVisibleValues?: number;
    maxVisibleValuesTextLength?: number;
    hideClear?: boolean;
    hideFilter?: boolean;
    onChange?: (v: Required<YTSelectProps>['value']) => void;
    onUpdate?: (v: Array<T>) => void;

    renderItem?: (item: Item, useNoValue?: boolean) => React.ReactNode;
}

export interface Item<T extends string = string> {
    value: T;
    text?: React.ReactNode;
    count?: number;
    icon?: React.ReactNode;
}

const emptyValue: Array<string> = [];

export default function SelectFacade<T extends string = string>(props: YTSelectProps<T>) {
    const {items, onUpdate, onChange, value, ...rest} = props;
    const {options, hashByValue} = React.useMemo(() => {
        return prepareItems(items);
    }, [items]);

    const handleChange = React.useCallback(
        (newValue: Required<YTSelectProps<T>>['value']) => {
            onChange?.(newValue);
            onUpdate?.(newValue);
        },
        [onChange, onUpdate],
    );

    const filteredValue = React.useMemo(() => {
        const res = filter_(value, Boolean);
        return res.length ? res : emptyValue;
    }, [value]);

    return (
        <CustomSelect
            onUpdate={handleChange as any}
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

interface SelectSingleProps<T extends string>
    extends Omit<YTSelectProps<T>, 'value' | 'onUpdate' | 'onChange'> {
    value?: string;
    onChange?: (v?: string) => void;
}

export function SelectSingle<T extends string = string>(props: SelectSingleProps<T>) {
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

SelectSingle.isEmpty = (value: SelectSingleProps<string>['value']) => {
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
        Pick<
            YTSelectProps,
            'hideClear' | 'hideFilter' | 'renderItem' | 'maxVisibleValuesTextLength'
        >
> {
    static defaultProps = {
        width: 'max',
    };

    render() {
        const {className, hideFilter, ...props} = this.props;
        return (
            <Select
                className={block(null, className)}
                disablePortal={false}
                {...props}
                options={props.options}
                filterable={!hideFilter}
                renderOption={this.renderOption}
                renderControl={this.renderControl}
                renderFilter={this.renderFilter}
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
            maxVisibleValuesTextLength,
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
                    maxVisibleValuesTextLength,
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

interface ValueControlProps extends Omit<Extra, 'ref' | 'triggerProps'> {
    controlRef: React.Ref<HTMLElement>;
    hashByValue: Map<string, SelectOption>;
    maxVisibleValues?: YTSelectProps['maxVisibleValues'];
    placeholder?: SelectProps['placeholder'];
    className?: string;
    triggerProps?: SelectRenderControlProps['triggerProps'];
}

function ValueControl({
    className,
    value,
    label,
    hashByValue,
    controlRef,
    width,
    pin,
    disabled,
    maxVisibleValues,
    maxVisibleValuesTextLength,
    placeholder,
    renderItem,
    triggerProps,
}: ValueControlProps &
    Pick<SelectProps, 'value' | 'pin' | 'label' | 'width' | 'disabled'> &
    Pick<Required<YTSelectProps>, 'renderItem'> &
    Pick<YTSelectProps, 'maxVisibleValuesTextLength'>) {
    const {w, style} =
        typeof width !== 'number' ? {w: width, style: undefined} : {style: {width}, w: undefined};

    return (
        <Button
            className={block(null, className)}
            ref={controlRef as any}
            view="outlined"
            onClick={triggerProps?.onClick}
            width={w}
            style={style}
            {...{pin, disabled}}
        >
            <span className={block('control-value')}>
                {label && <Text className={block('control-label')}>{label}</Text>}
                {!value?.length ? (
                    <Text color="hint" variant="inherit">
                        {placeholder ?? hammer.format.NO_VALUE}
                    </Text>
                ) : (
                    <VisibleValues
                        value={value}
                        maxVisibleValues={maxVisibleValues}
                        maxTextLength={maxVisibleValuesTextLength}
                        renderItem={(item: string) => {
                            const option = hashByValue.get(item);
                            if (option) {
                                return renderItem(option.data, true);
                            }
                            return <Text color="secondary">{renderItem({value: item}, true)}</Text>;
                        }}
                    />
                )}
            </span>
            <Chevron className={block('chevron')} />
        </Button>
    );
}
