import React, {useCallback, useState} from 'react';
import {HelpMark} from '@gravity-ui/uikit';
import Button from '../../../../components/Button/Button';
import useResizeObserver from '../../../../hooks/useResizeObserver';
import {useRoutedClickHandler} from '../../../../hooks/useRoutedClickHandler';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    getPreviewCollapsed,
    setPreviewCollapsed,
} from '../../../../store/reducers/navigation/description';
import {CollapsibleSectionStateLess} from '../../../../components/CollapsibleSection/CollapsibleSection';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';
import {selectPath} from '../../../../store/selectors/navigation';
import {selectCluster} from '../../../../store/selectors/global';
import {Tab} from '../../../../constants/navigation';
import {setMode} from '../../../../store/actions/navigation';
import {makeNavigationLink} from '../../../../utils/app-url';
import cn from 'bem-cn-lite';
import {Markdown} from '../../../../components/Markdown/Markdown';
import {useDescription} from '../hooks/use-description';
import i18n from '../i18n';
import './NavigationDescriptionPreview.scss';

const block = cn('navigation-description-preview');

export function NavigationDescriptionPreview() {
    const {description, error} = useDescription();
    const [element, setElement] = useState<HTMLElement | null>(null);
    const handleResize = useCallback(() => {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }, []);
    useResizeObserver({element, onResize: handleResize});
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);
    const dispatch = useDispatch();
    const collapsed = useSelector(getPreviewCollapsed);
    const handleOpen = useRoutedClickHandler({
        navigate: () => dispatch(setMode(Tab.ANNOTATION)),
        onClick: undefined,
    });
    return (
        <section
            ref={setElement}
            className={block({empty: !description || Boolean(error)})}
            aria-label={i18n('title_description')}
        >
            {description && !error && (
                <CollapsibleSectionStateLess
                    className={block('section')}
                    headingClassName={block('heading')}
                    name={i18n('title_description')}
                    size={UI_COLLAPSIBLE_SIZE}
                    collapsed={collapsed}
                    onToggle={(value) => dispatch(setPreviewCollapsed(value))}
                    togglerRightPadding="small"
                    overview={
                        <HelpMark aria-label={i18n('context_text-preview')}>
                            {i18n('context_text-preview')}
                        </HelpMark>
                    }
                >
                    <div className={block('text')} data-qa="navigation-description-preview-text">
                        <Markdown text={description} allowHTML={false} />
                    </div>
                    <Button
                        className={block('action')}
                        view="flat-secondary"
                        href={makeNavigationLink({path, cluster, navmode: Tab.ANNOTATION})}
                        onClick={handleOpen}
                    >
                        {i18n('action_view-full-description')}
                    </Button>
                </CollapsibleSectionStateLess>
            )}
        </section>
    );
}
