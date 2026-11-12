import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import React from 'react';
import {Label, Tooltip} from '@ytsaurus/components';
import {getDescriptionType, getEditMode} from '../../../../store/reducers/navigation/description';
import {useSelector} from '../../../../store/redux-hooks';
import {selectPath} from '../../../../store/selectors/navigation';
import UIFactory from '../../../../UIFactory';
import {DescriptionSourcePath} from '../DescriptionSourcePath/DescriptionSourcePath';
import {EditButtons} from '../EditButtons';
import {useDescription} from '../hooks/use-description';
import {useExternalAnnotation} from '../hooks/use-external-annotation';
import {SwitchDescription} from '../SwitchDescription';
import i18n from './i18n';

export function NavigationDescriptionToolbar() {
    const {externalAnnotationLink, editable} = useExternalAnnotation();
    const descriptionType = useSelector(getDescriptionType);
    const editMode = useSelector(getEditMode);

    const path = useSelector(selectPath);
    const {path: descriptionPath, description} = useDescription();

    const inheritedPath = path !== descriptionPath ? descriptionPath : undefined;

    const {externalServiceName, edit, load} = UIFactory?.externalAnnotationSetup ?? {};

    const hasExternal = Boolean(load);

    const allowEdit =
        (Boolean(description) || editMode) &&
        (descriptionType === 'yt' || Boolean(edit)) &&
        !inheritedPath;
    const readonly =
        Boolean(description) && descriptionType === 'external' && !editable && !inheritedPath;

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'}>
            {hasExternal && <SwitchDescription />}
            {allowEdit && <EditButtons readonly={readonly} />}
            {descriptionType === 'external' && externalAnnotationLink && (
                <Tooltip content={externalServiceName || ''}>
                    <Link href={externalAnnotationLink || ''} target="_blank">
                        <Button view="outlined">
                            <Icon data={ArrowUpRightFromSquare} size={13} />
                        </Button>
                    </Link>
                </Tooltip>
            )}
            {readonly && (
                <Text>
                    <Label>{i18n('value_readonly')}</Label>
                </Text>
            )}
            {inheritedPath ? (
                <Text>
                    <DescriptionSourcePath path={inheritedPath} />
                </Text>
            ) : null}
        </Flex>
    );
}
