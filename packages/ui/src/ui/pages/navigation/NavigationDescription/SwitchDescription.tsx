import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Flex, SegmentedRadioGroup} from '@gravity-ui/uikit';

import {
    getDescriptionType,
    setDescriptionType,
} from '../../../store/reducers/navigation/description';

import UIFactory from '../../../UIFactory';

export function SwitchDescription() {
    const dispatch = useDispatch();

    const descriptionType = useSelector(getDescriptionType);

    const onUpdate = (value: 'yt' | 'external') =>
        dispatch(setDescriptionType({descriptionType: value}));

    return (
        <Flex direction={'row'} gap={1}>
            <SegmentedRadioGroup
                options={[
                    {value: 'yt', content: 'YT'},
                    {
                        value: 'external',
                        content:
                            UIFactory?.externalAnnotationSetup?.externalServiceName || 'External',
                    },
                ]}
                value={descriptionType}
                size={'m'}
                onUpdate={onUpdate}
            />
        </Flex>
    );
}
