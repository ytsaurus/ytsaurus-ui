import {Button, Flex, Icon, Link, Tooltip} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import React from 'react';
import {getDescriptionType} from '../../../store/reducers/navigation/description';
import {useSelector} from '../../../store/redux-hooks';
import UIFactory from '../../../UIFactory';
import {EditButtons} from './EditButtons';
import {useExternalAnnotation} from './hooks/use-external-annotation';
import {SwitchDescription} from './SwitchDescription';

export function NavigationDescriptionOverview() {
    const {externalAnnotationLink, editable} = useExternalAnnotation();
    const descriptionType = useSelector(getDescriptionType);

    const {externalServiceName, edit, load} = UIFactory?.externalAnnotationSetup ?? {};

    const hasExternal = Boolean(load);
    const allowEdit = descriptionType === 'yt' || Boolean(edit && editable);

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'}>
            {hasExternal && <SwitchDescription />}
            {allowEdit && <EditButtons />}
            {descriptionType === 'external' && (
                <Tooltip content={externalServiceName || ''}>
                    <Link href={externalAnnotationLink || ''} target="_blank">
                        <Button view="outlined">
                            <Icon data={ArrowUpRightFromSquare} size={13} />
                        </Button>
                    </Link>
                </Tooltip>
            )}
        </Flex>
    );
}
