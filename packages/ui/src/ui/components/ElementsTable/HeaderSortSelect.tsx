import {ChevronDown} from '@gravity-ui/icons';
import {Select, SelectOption, SelectRenderControl, SelectRenderOption} from '@gravity-ui/uikit';
import React from 'react';
import {ChangeColumnSortOrderParams} from '../../store/actions/tables';
import {OrderType} from '../../utils/sort-helpers';

type Props = {
    value: string | undefined;
    orderType: OrderType | undefined;
    columnName: string;
    tableId: string;
    defaultValue: string[] | undefined;
    sortSelectItems: SelectOption[];
    changeColumnSortOrder: (params: ChangeColumnSortOrderParams) => void;
    onChange: (columnName: string, selectField: string) => void;
};

export const HeaderSortSelect = ({
    changeColumnSortOrder,
    value,
    orderType,
    columnName,
    defaultValue,
    tableId,
    sortSelectItems,
    onChange,
}: Props) => {
    const selectValue = value ? [value] : undefined;
    const defaultSelectValue = orderType?.length !== 0 ? defaultValue : undefined;

    if (!sortSelectItems || sortSelectItems.length === 0) return null;

    const renderControl: SelectRenderControl = ({onClick, onKeyDown, ref}) => {
        const by = sortSelectItems?.find((el) => el.value === value)?.content ?? '';
        const text = by ? `by ${by}` : '';

        return (
            <div
                onClick={onClick}
                onKeyDown={onKeyDown}
                ref={ref as any}
                className={'custom-select' + (value !== undefined ? ' selected' : '')}
            >
                {text}
                <ChevronDown />
            </div>
        );
    };

    const renderOption: SelectRenderOption<typeof sortSelectItems> = (option) => {
        return <div className="custom-option">{option.content}</div>;
    };

    const handleUpdate = (option: string[]) => {
        changeColumnSortOrder({
            columnName,
            tableId,
            asc: orderType === 'asc',
            selectField: option[0],
        });
        onChange(columnName, option[0]);
    };

    return (
        <div onClick={(e) => e.stopPropagation()} style={{marginLeft: '8px'}}>
            <Select
                className={'column-select'}
                renderControl={renderControl}
                renderOption={renderOption}
                onUpdate={handleUpdate}
                defaultValue={defaultSelectValue}
                value={selectValue}
                placeholder="by"
                size="s"
                options={sortSelectItems}
            />
        </div>
    );
};
