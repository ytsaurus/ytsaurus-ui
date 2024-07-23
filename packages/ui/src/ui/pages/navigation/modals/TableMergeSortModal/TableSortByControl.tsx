import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {ColumnSelector} from '../../../../components/common/ColumnSelector';
import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import Icon from '../../../../components/Icon/Icon';

import './TableSortByControl.scss';

const block = cn('table-sort-by-control');

export interface TableSortByControlProps extends DialogControlProps<Array<ColumnSortByInfo>> {
    suggestColumns: Array<string>;
    allowDescending?: boolean;
}

export interface ColumnSortByInfo {
    name: string;
    descending?: boolean;
}

export function TableSortByControl(props: TableSortByControlProps) {
    const {value, suggestColumns, onChange, allowDescending} = props;
    const columns = React.useMemo(() => {
        return map_(value, 'name');
    }, [value]);
    const [descendingMap, setDescendingMap] = React.useState<Record<string, boolean>>({});

    const handleChange = React.useCallback(
        (newColumns: Array<string>) => {
            const newValue = map_(newColumns, (name) => {
                const res: ColumnSortByInfo = {name};
                if (descendingMap[name]) {
                    res.descending = true;
                }
                return res;
            });
            onChange(newValue);
        },
        [descendingMap, onChange],
    );

    return (
        <ColumnSelector
            className={block()}
            value={columns}
            onUpdate={handleChange}
            items={suggestColumns}
            renderItemValue={(name: string) => {
                const desc = descendingMap[name];
                const icon = desc ? 'sort-amount-up' : 'sort-amount-down-alt';
                return (
                    <div className={block('item')}>
                        {allowDescending && (
                            <span
                                className={block('item-icon')}
                                title={desc ? 'Descending' : 'Ascending'}
                                onClick={() => {
                                    const newMap = {...descendingMap};
                                    if (descendingMap[name]) {
                                        delete newMap[name];
                                    } else {
                                        newMap[name] = true;
                                    }
                                    setDescendingMap(newMap);
                                }}
                            >
                                <Icon awesome={icon} />
                            </span>
                        )}
                        <span className={block('item-name')}>{name}</span>
                    </div>
                );
            }}
        />
    );
}

TableSortByControl.getDefaultValue = () => {
    return [];
};

TableSortByControl.isEmpty = (v: TableSortByControlProps['value']) => {
    return !v?.length;
};
