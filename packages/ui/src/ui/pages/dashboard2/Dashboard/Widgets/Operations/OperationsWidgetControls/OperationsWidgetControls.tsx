import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, RadioButton, Select} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {
    setOperationsAuthorTypeFilter,
    setOperationsStateFilter,
} from '../../../../../../store/actions/dashboard2/operations';
import {
    getOperationsAuthorTypeFilter,
    getOperationsStateFilter,
} from '../../../../../../store/selectors/dashboard2/operations';

import type {OperationsWidgetProps} from '../types';

import './OperationsWidgetControls.scss';

const block = b('yt-operations-widget-controls');

export function OperationsWidgetControls(props: OperationsWidgetProps) {
    const {id} = props;

    const dispatch = useDispatch();

    const state = useSelector((state: RootState) => getOperationsStateFilter(state, id));
    const authorType = useSelector((state: RootState) => getOperationsAuthorTypeFilter(state, id));

    const onStateFilterUpdate = (value: string[]) => {
        dispatch(setOperationsStateFilter(id, value[0]));
    };
    const onAuthorTypeFilterUpdate = (value: 'me' | 'custom') => {
        dispatch(setOperationsAuthorTypeFilter(id, value));
    };

    return (
        <Flex direction={'row'} alignItems={'center'} gap={3}>
            <Select
                options={[
                    {value: 'all', content: 'All'},
                    {value: 'pending', content: 'Pending'},
                    {value: 'completed', content: 'Completed'},
                    {value: 'running', content: 'Running'},
                    {value: 'failed', content: 'Failed'},
                    {value: 'aborted', content: 'Aborted'},
                ]}
                label={'State:'}
                value={[state]}
                onUpdate={onStateFilterUpdate}
                className={block('state')}
            />
            <RadioButton
                options={[
                    {value: 'me', content: 'Me'},
                    {value: 'custom', content: 'Custom'},
                ]}
                onUpdate={onAuthorTypeFilterUpdate}
                value={authorType}
            />
        </Flex>
    );
}
