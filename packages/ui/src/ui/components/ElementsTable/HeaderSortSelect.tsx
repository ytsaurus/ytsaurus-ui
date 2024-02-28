import {BarsDescendingAlignLeft} from '@gravity-ui/icons';
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
    onLoadingFinished: () => void;
};

export const HeaderSortSelect = ({
    value,
    orderType,
    columnName,
    defaultValue,
    tableId,
    sortSelectItems,
    changeColumnSortOrder,
    onChange,
    onLoadingFinished,
}: Props) => {
    const selectValue = value ? [value] : undefined;
    const defaultSelectValue = orderType?.length !== 0 ? defaultValue : undefined;

    if (!sortSelectItems || sortSelectItems.length === 0) return null;

    const renderControl: SelectRenderControl = ({onClick, onKeyDown, ref}) => {
        return (
            <div
                onClick={onClick}
                onKeyDown={onKeyDown}
                ref={ref as any}
                className={'custom-select' + (value !== undefined ? ' selected' : '')}
            >
                <BarsDescendingAlignLeft />
            </div>
        );
    };

    const renderOption: SelectRenderOption<typeof sortSelectItems> = (option) => {
        return <div className="custom-option">{option.content}</div>;
    };

    const handleUpdate = (option: string[]) => {
        onChange(columnName, option[0]);
        setTimeout(() => {
            changeColumnSortOrder({
                columnName,
                tableId,
                asc: orderType === 'asc',
                selectField: option[0],
            });
            onLoadingFinished();
        }, 1);
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
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
