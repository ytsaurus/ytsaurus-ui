import React from 'react';
import cn from 'bem-cn-lite';
import {Xmark} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';
import {Tab} from '../../../../constants/navigation';
import {makeNavigationLink} from '../../../../utils/app-url';
import {DescriptionSourcePath} from '../DescriptionSourcePath/DescriptionSourcePath';
import {Markdown} from '../../../../components/Markdown/Markdown';
import i18n from '../i18n';
import './NavigationDescriptionPanel.scss';

const block = cn('navigation-description-panel');

type Props = {
    description: string;
    onClose: () => void;
    path: string;
    cluster: string;
    inheritedPath?: string;
};

export function NavigationDescriptionPanel({
    description,
    path,
    cluster,
    inheritedPath,
    onClose,
}: Props) {
    const history = useHistory();
    const onOpenTab = () => {
        history.push(makeNavigationLink({path, cluster, navmode: Tab.ANNOTATION}));
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
                    <Text variant="subheader-2">{i18n('title_description')}</Text>
                    {inheritedPath && (
                        <DescriptionSourcePath path={inheritedPath} cluster={cluster} />
                    )}
                </Flex>
                <Flex direction="row" alignItems="center" gap={1} shrink={0}>
                    <Button view="flat-secondary" onClick={onOpenTab}>
                        {i18n('action_open-description-tab')}
                    </Button>
                    <Button view="flat-secondary" onClick={onClose} title={i18n('action_close')}>
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
