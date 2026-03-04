import {ArrowUpRightFromSquare, CircleQuestion} from '@gravity-ui/icons';
import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import React from 'react';
import {ClipboardButton, Label, MetaTable, Tooltip} from '@ytsaurus/components';
import YTLink from '../../../../components/Link/Link';
import {getDescriptionType} from '../../../../store/reducers/navigation/description';
import {useSelector} from '../../../../store/redux-hooks';
import {getPath} from '../../../../store/selectors/navigation';
import UIFactory from '../../../../UIFactory';
import {makeNavigationLink} from '../../../../utils/app-url';
import {EditButtons} from '../EditButtons';
import {useDescription} from '../hooks/use-description';
import {useExternalAnnotation} from '../hooks/use-external-annotation';
import {SwitchDescription} from '../SwitchDescription';
import i18n from './i18n';

export function NavigationDescriptionOverview() {
    const {externalAnnotationLink, editable} = useExternalAnnotation();
    const descriptionType = useSelector(getDescriptionType);

    const path = useSelector(getPath);
    const {path: descriptionPath} = useDescription();

    const inheritedPath = path !== descriptionPath ? descriptionPath : undefined;

    const {externalServiceName, edit, load} = UIFactory?.externalAnnotationSetup ?? {};

    const hasExternal = Boolean(load);

    const allowEdit = (descriptionType === 'yt' || Boolean(edit)) && !inheritedPath;
    const readonly = descriptionType === 'external' && !editable && !inheritedPath;

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'}>
            {hasExternal && <SwitchDescription />}
            {allowEdit && <EditButtons readonly={readonly} />}
            {descriptionType === 'external' && (
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
                    <Label>{i18n('readonly')}</Label>
                </Text>
            )}
            {inheritedPath ? (
                <Text>
                    <SourcePath path={inheritedPath} />
                </Text>
            ) : null}
        </Flex>
    );
}

function SourcePath({path}: {path: string}) {
    const url = makeNavigationLink({path});
    return (
        <Tooltip
            content={
                <MetaTable
                    alignItems="baseline"
                    items={[
                        {
                            key: 'Source path',
                            value: (
                                <Flex alignItems="baseline">
                                    <YTLink theme="secondary" url={url} routed>
                                        {path}
                                    </YTLink>
                                    <ClipboardButton view="flat-secondary" text={path} />
                                </Flex>
                            ),
                        },
                    ]}
                />
            }
        >
            <Label>
                <Flex alignItems={'center'} gap={1}>
                    <YTLink theme="secondary" url={url} routed>
                        {i18n('inherited')}
                    </YTLink>{' '}
                    <Icon data={CircleQuestion} size={14} style={{marginBottom: '-2px'}} />
                </Flex>
            </Label>
        </Tooltip>
    );
}
