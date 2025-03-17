import React from 'react';
import {useDispatch} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Select} from '@gravity-ui/uikit';
// import {Gear} from '@gravity-ui/icons';

import map_ from 'lodash/map';

import hammer from '../../../../../../common/hammer';

import {
    setQueriesEngine,
    setQueriesState,
} from '../../../../../../store/reducers/dashboard2/queries';

import {QueryEngine, QueryStatus} from '../../../../../../types/query-tracker';

import './QueriesWidgetControls.scss';

const block = b('yt-queries-widget-controls');

const stateOptions = [
    {value: undefined, content: 'All'},
    ...map_(Object.keys(QueryStatus), (item) => ({
        value: item,
        content: hammer.format['ReadableField'](item.toLowerCase()),
    })),
];

const typeOptions = map_(Object.keys(QueryEngine), (item) => ({
    value: item,
    content: hammer.format['ReadableField'](item).toUpperCase(),
}));

export function QueriesWidgetControls() {
    const dispatch = useDispatch();

    const onStateUpdate = (value: string[]) => {
        dispatch(setQueriesState({state: value[0]}));
    };

    const onTypeUpdate = (value: string[]) => {
        dispatch(setQueriesEngine({engine: value[0]}));
    };

    return (
        <Flex direction={'row'} gap={2}>
            <Select
                onUpdate={onStateUpdate}
                options={stateOptions}
                className={block('select')}
                placeholder={'State'}
            />
            <Select
                onUpdate={onTypeUpdate}
                options={typeOptions}
                className={block('select')}
                placeholder={'Type'}
            />
            {/* <Button size="m">
                <Icon data={Gear} size={16} />
            </Button> */}
        </Flex>
    );
}
