import React, {useCallback, useState} from 'react';
import {Button, Flex, HelpMark, Icon, Link, Text} from '@gravity-ui/uikit';
import {LayoutSideContentRight} from '@gravity-ui/icons';
import {useHistory} from 'react-router';
import {getMetrics} from '../../../../common/utils/metrics';
import useResizeObserver from '../../../../hooks/useResizeObserver';
import {useDescriptionPanel} from '../NavigationDescriptionPanelProvider/NavigationDescriptionPanelProvider';
import {useRoutedClickHandler} from '../../../../hooks/useRoutedClickHandler';
import {useSelector} from '../../../../store/redux-hooks';
import {selectPath} from '../../../../store/selectors/navigation';
import {selectCluster} from '../../../../store/selectors/global';
import {Tab} from '../../../../constants/navigation';
import {makeNavigationLink} from '../../../../utils/app-url';
import cn from 'bem-cn-lite';
import {Markdown} from '../../../../components/Markdown/Markdown';
import {useDescription} from '../hooks/use-description';
import {useExternalAnnotation} from '../hooks/use-external-annotation';
import i18n from '../i18n';
import './NavigationDescriptionPreview.scss';

const block = cn('navigation-description-preview');

export function NavigationDescriptionPreview() {
    const {description, error, descriptionType, path: descriptionPath} = useDescription();
    const {externalAnnotationLink} = useExternalAnnotation();
    const history = useHistory();
    const [element, setElement] = useState<HTMLElement | null>(null);
    const handleResize = useCallback(() => {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }, []);
    useResizeObserver({element, onResize: handleResize});
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);
    const {toggle: toggleDescription, isOpen} = useDescriptionPanel();
    const descriptionUrl = makeNavigationLink({path, cluster, navmode: Tab.ANNOTATION});
    const handleToggle = () => {
        if (description) {
            if (!isOpen) {
                getMetrics().countEvent('navigation_description_drawer');
            }
            toggleDescription({
                description,
                descriptionType,
                externalAnnotationLink,
                path,
                cluster,
                inheritedPath: descriptionPath !== path ? descriptionPath : undefined,
            });
        }
    };
    const handleOpenTab = useRoutedClickHandler({
        navigate: () => history.push(descriptionUrl),
        onClick: () => {
            getMetrics().countEvent('navigation_description_link');
        },
    });
    return (
        <section
            ref={setElement}
            className={block({empty: !description || Boolean(error)})}
            aria-label={i18n('title_description')}
        >
            {description && !error && (
                <>
                    <Flex className={block('heading')} alignItems="center" gap={2}>
                        <Text variant="subheader-3">{i18n('title_description')}</Text>
                        <Flex grow={1} alignItems="center" justifyContent="space-between" gap={2}>
                            <HelpMark aria-label={i18n('context_text-preview')}>
                                {i18n('context_text-preview')}
                            </HelpMark>
                            <Button view="outlined" onClick={handleToggle}>
                                <Icon data={LayoutSideContentRight} size={16} />
                                {i18n('action_view-description')}
                            </Button>
                        </Flex>
                    </Flex>
                    <div className={block('text')} data-qa="navigation-description-preview-text">
                        <Markdown
                            text={description}
                            allowHTML={false}
                            contentBelow={
                                <Link
                                    className={block('action')}
                                    href={descriptionUrl}
                                    onClick={handleOpenTab}
                                >
                                    {i18n('action_view-full-description')}
                                </Link>
                            }
                        />
                    </div>
                </>
            )}
        </section>
    );
}
