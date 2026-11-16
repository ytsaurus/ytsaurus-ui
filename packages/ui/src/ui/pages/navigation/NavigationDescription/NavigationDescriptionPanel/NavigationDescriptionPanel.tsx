import React from 'react';
import cn from 'bem-cn-lite';
import {ArrowUpRightFromSquare, Pencil, Xmark} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';
import {Tab} from '../../../../constants/navigation';
import UIFactory from '../../../../UIFactory';
import {makeNavigationLink} from '../../../../utils/app-url';
import {DescriptionSourcePath} from '../DescriptionSourcePath/DescriptionSourcePath';
import {Markdown} from '../../../../components/Markdown/Markdown';
import i18n from '../i18n';
import {trackDescriptionEdit} from '../metrics';
import './NavigationDescriptionPanel.scss';

const block = cn('navigation-description-panel');

export type DescriptionSnapshot = {
    description: string;
    descriptionType: 'yt' | 'external';
    externalAnnotationLink?: string;
    path: string;
    cluster: string;
    inheritedPath?: string;
};

type Props = DescriptionSnapshot & {onClose: () => void};

export function NavigationDescriptionPanel({
    description,
    descriptionType,
    externalAnnotationLink,
    path,
    cluster,
    inheritedPath,
    onClose,
}: Props) {
    const history = useHistory();
    const externalServiceName = UIFactory.externalAnnotationSetup?.externalServiceName;
    const source = descriptionType === 'yt' ? 'YT' : externalServiceName || i18n('value_external');
    const onEdit = () => {
        trackDescriptionEdit(descriptionType, 'drawer');
        history.push(makeNavigationLink({path, cluster, navmode: Tab.ANNOTATION}), {
            editDescription: {path, cluster},
        });
        onClose();
    };
    return (
        <section className={block()} aria-label={i18n('title_full-description')}>
            <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                shrink={0}
                className={block('header')}
            >
                <Flex alignItems="center" gap={2} wrap="wrap">
                    <Text variant="subheader-1">{i18n('title_source-description', {source})}</Text>
                    {inheritedPath && (
                        <DescriptionSourcePath path={inheritedPath} cluster={cluster} />
                    )}
                </Flex>
                <Flex direction="row" alignItems="center" gap={1} shrink={0}>
                    {descriptionType === 'yt' && !inheritedPath && (
                        <Button view="flat" onClick={onEdit} title={i18n('action_edit')}>
                            <Icon data={Pencil} size={16} />
                        </Button>
                    )}
                    {descriptionType === 'external' && externalAnnotationLink && (
                        <Button
                            view="flat"
                            href={externalAnnotationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={i18n('action_open-external', {service: source})}
                        >
                            <Icon data={ArrowUpRightFromSquare} size={16} />
                        </Button>
                    )}
                    <Button view="flat" onClick={onClose} title={i18n('action_close')}>
                        <Icon data={Xmark} size={16} />
                    </Button>
                </Flex>
            </Flex>
            <div className={block('content')}>
                <Markdown text={description} />
            </div>
        </section>
    );
}
