import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, RadioButton, Select} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {
    setOperationsAuthorTypeFilter,
    setOperationsStateFilter,
} from '../../../../../../store/actions/dashboard2/operations';
import {getOperationsAuthorTypeFilter} from '../../../../../../store/selectors/dashboard2/operations';

import './OperationsWidgetControls.scss';

const block = b('yt-operations-widget-controls');

export function OperationsWidgetControls(props: PluginWidgetProps) {
    const {id} = props;

    const dispatch = useDispatch();

    const authorType = useSelector((state: RootState) => getOperationsAuthorTypeFilter(state, id));

    const onStateFilterUpdate = (value: string[]) => {
        dispatch(setOperationsStateFilter(id, value[0]));
    };
    const onAuthorTypeFilterUpdate = (value: 'me' | 'my-list') => {
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
                defaultValue={['all']}
                onUpdate={onStateFilterUpdate}
                className={block('state')}
            />
            <RadioButton
                options={[
                    {value: 'me', content: 'Me'},
                    {value: 'my-list', content: 'My list'},
                ]}
                onUpdate={onAuthorTypeFilterUpdate}
                value={authorType}
            />
        </Flex>
    );
}
