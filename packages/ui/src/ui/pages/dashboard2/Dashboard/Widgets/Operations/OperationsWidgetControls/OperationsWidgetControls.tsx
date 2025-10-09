import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, SegmentedRadioGroup, Select} from '@gravity-ui/uikit';

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

import i18n from '../i18n';

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
                    {value: 'all', content: i18n('value_all')},
                    {value: 'pending', content: i18n('value_pending')},
                    {value: 'completed', content: i18n('value_completed')},
                    {value: 'running', content: i18n('value_running')},
                    {value: 'failed', content: i18n('value_failed')},
                    {value: 'aborted', content: i18n('value_aborted')},
                ]}
                label={i18n('label_state')}
                value={[state]}
                onUpdate={onStateFilterUpdate}
                className={block('state')}
                qa={'operations-state-filter'}
            />
            <SegmentedRadioGroup
                options={[
                    {value: 'me', content: i18n('value_me')},
                    {value: 'custom', content: i18n('value_custom')},
                ]}
                onUpdate={onAuthorTypeFilterUpdate}
                value={authorType}
                qa={'operations-author-filter'}
            />
        </Flex>
    );
}
