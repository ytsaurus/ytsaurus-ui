import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {Button, Flex, Link, Tooltip} from '@gravity-ui/uikit';

import {getDescriptionType} from '../../../store/reducers/navigation/description';

import Icon from '../../../components/Icon/Icon';

import UIFactory from '../../../UIFactory';

import {useExternalAnnotation} from './hooks/use-external-annotation';

import {EditButtons} from './EditButtons';
import {SwitchDescription} from './SwitchDescription';

export function NavigationDescriptionOverview() {
    const {externalAnnotationLink} = useExternalAnnotation();
    const descriptionType = useSelector(getDescriptionType);

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'}>
            {UIFactory?.externalAnnotationSetup && <SwitchDescription />}
            {descriptionType === 'yt' && <EditButtons />}
            {descriptionType === 'external' && (
                <Tooltip content={UIFactory?.externalAnnotationSetup?.externalServiceName || ''}>
                    <Link href={externalAnnotationLink || ''} target="_blank">
                        <Button view="outlined">
                            <Icon awesome="external-link" />
                        </Button>
                    </Link>
                </Tooltip>
            )}
        </Flex>
    );
}
