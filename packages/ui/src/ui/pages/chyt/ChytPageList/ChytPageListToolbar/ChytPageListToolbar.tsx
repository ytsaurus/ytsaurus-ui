import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {Button, TextInput} from '@gravity-ui/uikit';

import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {SelectSingle} from '../../../../components/Select/Select';
import ColumnSelectorModal from '../../../../components/ColumnSelectorModal/ColumnSelectorModal';

import {chytUpdateListFilters} from '../../../../store/actions/chyt/list-fitlers';
import {
    selectChytListAvailableCreators,
    selectChytListAvailableHealths,
    selectChytListAvailableStates,
    selectChytListColumns,
    selectChytListFilterAlias,
    selectChytListFilterCreator,
    selectChytListFilterHealth,
    selectChytListFilterState,
} from '../../../../store/selectors/chyt';
import {type ChytListFilters} from '../../../../store/reducers/chyt/list-filters';
import {chytSetVisibleColumns} from '../../../../store/actions/chyt/list';
import {CHYT_TABLE_TITLES} from '../../helpers/chyt-list-columns';
import Icon from '../../../../components/Icon/Icon';
import i18nChytValues from '../../i18n-chyt-values';

import './ChytPageListToolbar.scss';

import i18n from './i18n';

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
                    name: 'health',
                    node: <HealthFilter onUpdate={onUpdate} />,
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
    const value = useSelector(selectChytListFilterAlias);

    return (
        <TextInput
            value={value}
            onUpdate={(name) => {
                onUpdate({name});
            }}
            placeholder={i18n('field_filter-placeholder')}
        />
    );
}

function CreatorFilter({onUpdate}: {onUpdate: (value: {creator?: string}) => void}) {
    const value = useSelector(selectChytListFilterCreator);
    const creators = useSelector(selectChytListAvailableCreators);

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
            label={i18n('field_creator') + ':'}
            value={value}
            items={items}
            onChange={(creator) => {
                onUpdate({creator});
            }}
        />
    );
}

function HealthFilter({onUpdate}: {onUpdate: (value: {health?: string}) => void}) {
    const value = useSelector(selectChytListFilterHealth);
    const choices = useSelector(selectChytListAvailableHealths);

    const items = React.useMemo(() => {
        return choices.map((item) => {
            return {
                value: item,
                text: i18nChytValues(`state-value_${item}`),
            };
        });
    }, [choices]);

    return (
        <SelectSingle
            className={block('select-filter')}
            label={i18n('field_health') + ':'}
            value={value}
            items={items}
            onChange={(health) => {
                onUpdate({health});
            }}
        />
    );
}

function StateFilter({onUpdate}: {onUpdate: (value: {state?: string}) => void}) {
    const value = useSelector(selectChytListFilterState);
    const states = useSelector(selectChytListAvailableStates);

    const items = React.useMemo(() => {
        return states.map((item) => {
            return {
                value: item,
                text: i18nChytValues(`state-value_${item}`),
            };
        });
    }, [states]);
    return (
        <SelectSingle
            className={block('select-filter')}
            label={i18n('field_state') + ':'}
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
    const columns = useSelector(selectChytListColumns);

    const dialog = (
        <ColumnSelectorModal
            isVisible={visible}
            items={columns.map((i) => {
                return {
                    name: CHYT_TABLE_TITLES[i.column],
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
            itemRenderer={(item) => item.name}
        />
    );

    return (
        <React.Fragment>
            {visible && dialog}
            <Button view="outlined" onClick={() => setVisible(true)}>
                <Icon awesome="layout-columns-3" />
                {i18n('action_columns')}
            </Button>
        </React.Fragment>
    );
}

export default React.memo(ChytPageListToolbar);
