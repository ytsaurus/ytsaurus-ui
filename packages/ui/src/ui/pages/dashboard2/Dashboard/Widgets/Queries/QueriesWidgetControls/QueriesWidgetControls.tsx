import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Select} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import map_ from 'lodash/map';

import hammer from '../../../../../../common/hammer';

import {RootState} from '../../../../../../store/reducers';
import {
    getSettingQueryFilterEngine,
    getSettingQueryFilterState,
} from '../../../../../../store/selectors/dashboard2/queries';
import {
    setQueryEngineFilter,
    setQueryStateFilter,
} from '../../../../../../store/actions/dashboard2/queries';

import {QueryEngine} from '../../../../../../../shared/constants/engines';

import './QueriesWidgetControls.scss';

const block = b('yt-queries-widget-controls');

const statuses = ['draft', 'running', 'completed', 'failed', 'aborted'];
const stateOptions = [
    {value: '', content: 'All'},
    ...map_(statuses, (item) => ({
        value: item,
        content: hammer.format['ReadableField'](item.toLowerCase()),
    })),
];

const typeOptions = [
    {value: '', content: 'All'},
    ...map_(Object.keys(QueryEngine), (item) => ({
        value: item,
        content: hammer.format['ReadableField'](item).toUpperCase(),
    })),
];

export function QueriesWidgetControls(props: PluginWidgetProps) {
    const {id} = props;

    const dispatch = useDispatch();

    const queryState = useSelector((state: RootState) => getSettingQueryFilterState(state, id));
    const engine = useSelector((state: RootState) => getSettingQueryFilterEngine(state, id));

    const onStateUpdate = (value: string[]) => {
        dispatch(setQueryStateFilter(id, value[0]));
    };

    const onTypeUpdate = (value: string[]) => {
        dispatch(setQueryEngineFilter(id, value[0]));
    };

    return (
        <Flex direction={'row'} gap={2}>
            <Select
                onUpdate={onStateUpdate}
                options={stateOptions}
                className={block('select')}
                placeholder={`State: ${queryState || 'All'}`}
                defaultValue={[queryState || '']}
            />
            <Select
                onUpdate={onTypeUpdate}
                options={typeOptions}
                className={block('select')}
                placeholder={`Type: ${engine || 'All'}`}
                defaultValue={[engine || '']}
            />
        </Flex>
    );
}
