import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, TextInput} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';

import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {SelectSingle} from '../../../components/Select/Select';
import ColumnSelectorModal from '../../../components/ColumnSelectorModal/ColumnSelectorModal';

import {chytUpdateListFilters} from '../../../store/actions/chyt/list-fitlers';
import {
    getChytListAvailableCreators,
    getChytListAvailableStates,
    getChytListColumns,
    getChytListFilterAlias,
    getChytListFilterCreator,
    getChytListFilterState,
} from '../../../store/selectors/chyt';
import {ChytListFilters} from '../../../store/reducers/chyt/list-filters';
import {chytSetVisibleColumns} from '../../../store/actions/chyt/list';

import './ChytPageListToolbar.scss';

const block = cn('chyt-list-toolbar');

function ChytPageListToolbar() {
    const dispatch = useDispatch();

    const onUpdate = React.useCallback(
        (filters: Partial<ChytListFilters>) => {
            dispatch(chytUpdateListFilters(filters));
        },
        [dispatch],
    );

    return (
        <Toolbar
            itemsToWrap={[
                {
                    name: 'alias',
                    node: <NameIdFilter onUpdate={onUpdate} />,
                    growable: true,
                    wrapperClassName: block('name-filter'),
                },
                {
                    name: 'creator',
                    node: <CreatorFilter onUpdate={onUpdate} />,
                },
                {
                    name: 'state',
                    node: <StateFilter onUpdate={onUpdate} />,
                },
                {
                    name: 'columns',
                    node: <ChytListColumnsButton />,
                },
            ]}
        />
    );
}

function NameIdFilter({onUpdate}: {onUpdate: (value: {name: string}) => void}) {
    const value = useSelector(getChytListFilterAlias);

    return (
        <TextInput
            value={value}
            onUpdate={(name) => {
                onUpdate({name});
            }}
            placeholder="Filter by alias name or id..."
        />
    );
}

function CreatorFilter({onUpdate}: {onUpdate: (value: {creator?: string}) => void}) {
    const value = useSelector(getChytListFilterCreator);
    const creators = useSelector(getChytListAvailableCreators);

    const items = React.useMemo(() => {
        return creators.map((item) => {
            return {
                value: item,
                text: item,
            };
        });
    }, [creators]);

    return (
        <SelectSingle
            className={block('select-filter')}
            label="Creator:"
            value={value}
            items={items}
            onChange={(creator) => {
                onUpdate({creator});
            }}
        />
    );
}

function StateFilter({onUpdate}: {onUpdate: (value: {state?: string}) => void}) {
    const value = useSelector(getChytListFilterState);
    const states = useSelector(getChytListAvailableStates);

    const items = React.useMemo(() => {
        return states.map((item) => {
            return {
                value: item,
                text: item,
            };
        });
    }, [states]);
    return (
        <SelectSingle
            className={block('select-filter')}
            label="State:"
            value={value}
            items={items}
            onChange={(state) => {
                onUpdate({state});
            }}
        />
    );
}

function ChytListColumnsButton() {
    const dispatch = useDispatch();

    const [visible, setVisible] = React.useState(false);
    const columns = useSelector(getChytListColumns);

    const dialog = (
        <ColumnSelectorModal
            isVisible={visible}
            items={columns.map((i) => {
                return {
                    name: format.ReadableField(i.column),
                    checked: i.checked,
                    data: {
                        column: i.column,
                    },
                };
            })}
            onConfirm={(value) => {
                const newColumns = value.filter((i) => i.checked).map((i) => i.data.column);
                dispatch(chytSetVisibleColumns(newColumns));
                setVisible(false);
            }}
            onCancel={() => setVisible(false)}
        />
    );

    return (
        <React.Fragment>
            {visible && dialog}
            <Button view="outlined" onClick={() => setVisible(true)}>
                Columns
            </Button>
        </React.Fragment>
    );
}

export default React.memo(ChytPageListToolbar);
