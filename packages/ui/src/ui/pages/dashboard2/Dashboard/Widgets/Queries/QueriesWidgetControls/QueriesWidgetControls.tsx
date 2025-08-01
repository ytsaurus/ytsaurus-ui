import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Select} from '@gravity-ui/uikit';

import map_ from 'lodash/map';

import format from '../../../../../../common/hammer/format';

import {RootState} from '../../../../../../store/reducers';
import {
    getQueryFilterEngine,
    getQueryFilterState,
} from '../../../../../../store/selectors/dashboard2/queries';
import {
    setQueryEngineFilter,
    setQueryStateFilter,
} from '../../../../../../store/actions/dashboard2/queries';

import {QueryEngine} from '../../../../../../../shared/constants/engines';

import type {QueriesWidgetProps} from '../types';

import './QueriesWidgetControls.scss';

const block = b('yt-queries-widget-controls');

const statuses = ['draft', 'running', 'completed', 'failed', 'aborted'];
const stateOptions = [
    {value: '', content: 'All'},
    ...map_(statuses, (item) => ({
        value: item,
        content: format.ReadableField(item.toLowerCase()),
    })),
];

const engineOptions = [
    {value: '', content: 'All'},
    ...map_(Object.keys(QueryEngine), (item) => ({
        value: item,
        content: format.ReadableField(item).toUpperCase(),
    })),
];

export function QueriesWidgetControls(props: QueriesWidgetProps) {
    const {id} = props;

    const dispatch = useDispatch();

    const queryState = useSelector((state: RootState) => getQueryFilterState(state, id));
    const engine = useSelector((state: RootState) => getQueryFilterEngine(state, id));

    const onStateUpdate = (value: string[]) => {
        dispatch(setQueryStateFilter(id, value[0]));
    };

    const onEngineUpdate = (value: string[]) => {
        dispatch(setQueryEngineFilter(id, value[0]));
    };

    return (
        <Flex direction={'row'} gap={2}>
            <Select
                onUpdate={onStateUpdate}
                options={stateOptions}
                className={block('select')}
                label={`State:`}
                defaultValue={[queryState || '']}
            />
            <Select
                onUpdate={onEngineUpdate}
                options={engineOptions}
                className={block('select')}
                label={`Engine:`}
                defaultValue={[engine || '']}
            />
        </Flex>
    );
}
