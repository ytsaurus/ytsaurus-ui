import React, {Dispatch, SetStateAction} from 'react';
import {Flex, RadioButton} from '@gravity-ui/uikit';

import UIFactory from '../../../UIFactory';

type Props = {
    descriptionType: 'yt' | 'external';
    setDescriptionType: Dispatch<SetStateAction<'yt' | 'external'>>;
};

export function SwitchDescription(props: Props) {
    const {descriptionType, setDescriptionType} = props;

    return (
        <Flex direction={'row'} gap={1}>
            <RadioButton
                options={[
                    {value: 'yt', content: 'YT'},
                    {
                        value: 'external',
                        content:
                            UIFactory.externalAnnotationSetup?.externalServiceName || 'External',
                    },
                ]}
                value={descriptionType}
                size={'m'}
                onUpdate={(value) => setDescriptionType(value)}
            />
        </Flex>
    );
}
