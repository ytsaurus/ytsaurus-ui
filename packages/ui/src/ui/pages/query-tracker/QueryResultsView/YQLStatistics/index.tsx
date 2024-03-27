import {useDispatch, useSelector} from 'react-redux';
import {TextInput} from '@gravity-ui/uikit';
import React from 'react';
import block from 'bem-cn-lite';

import Icon from '../../../../components/Icon/Icon';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {
    getProgressYQLStatisticsFilterText,
    getProgressYQLStatisticsFiltered,
} from '../../module/query/selectors';
import {changeProgressYQLStatisticsFilter} from '../../module/query/actions';
import Button from '../../../../components/Button/Button';

import './index.scss';

const b = block('yql-statistics-table');

type ItemType = ReturnType<typeof getProgressYQLStatisticsFiltered>[0];

const columns = {
    name: {
        sort: false,
        align: 'left',
    },
    min: {
        sort: false,
        align: 'right',
    },
    max: {
        sort: false,
        align: 'right',
    },
    avg: {
        sort: false,
        align: 'right',
    },
    sum: {
        sort: false,
        align: 'right',
    },
    count: {
        sort: false,
        align: 'right',
    },
};

const tableProps = {
    theme: 'light',
    size: 's',
    striped: false,
    computeKey(item: ItemType) {
        return item.name;
    },
    tree: true,
    columns: {
        sets: {
            default: {
                items: Object.keys(columns),
            },
        },
        items: columns,
        mode: 'default',
    },
};

interface ItemState {
    collapsed?: boolean;
    empty?: boolean;
}

const template = {
    name(
        item: ItemType,
        _columnName: 'metric',
        toggleItemState: (...args: Array<unknown>) => void,
        itemState: ItemState,
    ) {
        const OFFSET = 40;
        const offsetStyle = {paddingLeft: item.level * OFFSET};

        if (item.isLeafNode) {
            return (
                <span style={offsetStyle}>
                    <Icon awesome="chart-line" />
                    &nbsp;
                    {item.title}
                </span>
            );
        } else {
            const togglerIconName =
                itemState.collapsed || itemState.empty ? 'angle-down' : 'angle-up';
            const itemIconName = itemState.collapsed || itemState.empty ? 'folder' : 'folder-open';

            const toggleItemAndTreeState = (...rest: Array<unknown>) => {
                if (!itemState.empty) {
                    toggleItemState(...rest);
                }
            };

            return (
                <span style={offsetStyle} onClick={toggleItemAndTreeState}>
                    <Icon awesome={togglerIconName} />
                    <Icon awesome={itemIconName} />
                    &nbsp;
                    <span>{item.title}</span>
                </span>
            );
        }
    },
    __default__(item: ItemType, columnName: keyof ItemType['data']) {
        if (item.isLeafNode) {
            return item.data?.[columnName] ?? '-';
        }

        return null;
    },
};

const TextFilter = () => {
    const dispatch = useDispatch();
    const filterText = useSelector(getProgressYQLStatisticsFilterText);

    const handleChangeFilter = React.useCallback(
        (text: string) => {
            dispatch(changeProgressYQLStatisticsFilter(text));
        },
        [changeProgressYQLStatisticsFilter, dispatch],
    );

    return (
        <TextInput
            size="m"
            hasClear={true}
            value={filterText}
            placeholder="Filter..."
            onChange={(value) => handleChangeFilter(value.target.value)}
        />
    );
};

export function YQLStatisticsTable() {
    const [treeState, setTreeState] = React.useState('expanded');
    const items = useSelector(getProgressYQLStatisticsFiltered);
    const collapseTable = React.useCallback(() => setTreeState('collapsed'), [setTreeState]);
    const expandTable = React.useCallback(() => setTreeState('expanded'), [setTreeState]);
    const mixedTable = React.useCallback(() => setTreeState('mixed'), [setTreeState]);

    return (
        <div className={b()}>
            <div className={b('filters')}>
                <div className={b('filters-col')}>
                    <TextFilter />
                </div>
                <div className={b('filters-col')}>
                    <Button size="m" title="Expand All" onClick={expandTable}>
                        <Icon awesome="arrow-to-bottom" />
                    </Button>
                    &nbsp;
                    <Button size="m" title="Collapse All" onClick={collapseTable}>
                        <Icon awesome="arrow-to-top" />
                    </Button>
                </div>
            </div>
            <ElementsTable
                {...tableProps}
                items={items}
                virtual={false}
                templates={template}
                treeState={treeState}
                onItemToggleState={mixedTable}
                headerClassName={b('header')}
            />
        </div>
    );
}
