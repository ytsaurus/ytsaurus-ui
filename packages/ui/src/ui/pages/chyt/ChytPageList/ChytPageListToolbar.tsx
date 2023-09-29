import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {TextInput} from '@gravity-ui/uikit';

import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {SelectSingle} from '../../../components/Select/Select';

import {updateChytListFilters} from '../../../store/actions/chyt/list-fitlers';
import {
    getChytListAvailableCreators,
    getChytListAvailableStates,
    getChytListFilterCreator,
    getChytListFilterAlias,
    getChytListFilterState,
} from '../../../store/selectors/chyt';
import {ChytListFilters} from '../../../store/reducers/chyt/list-filters';

import './ChytPageListToolbar.scss';

const block = cn('chyt-list-toolbar');

function ChytPageListToolbar() {
    const dispatch = useDispatch();

    const onUpdate = React.useCallback(
        (filters: Partial<ChytListFilters>) => {
            dispatch(updateChytListFilters(filters));
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
            ]}
        />
    );
}

function NameIdFilter({onUpdate}: {onUpdate: (value: {nameIdFilter: string}) => void}) {
    const value = useSelector(getChytListFilterAlias);

    return (
        <TextInput
            value={value}
            onUpdate={(nameIdFilter) => {
                onUpdate({nameIdFilter});
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

export default React.memo(ChytPageListToolbar);
