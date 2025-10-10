import React, {useCallback, useRef} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {
    getEditMode,
    getEdittingAnnotation,
    setEdittingAnnotation,
} from '../../../store/reducers/navigation/description';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {EditAnnotationWithPreview} from '../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';

import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {useDescription} from './hooks/use-description';
import {useDescriptionCollapse} from './hooks/use-description-collapse';
import {useYTAnnotation} from './hooks/use-yt-annotation';

import {NavigationDescriptionOverview} from './NavigationDescriptionOverview';
import {AnnotationWithPartial} from './AnnotationWithPartial';

import './NavigationDescription.scss';
import useResizeObserver from '../../../hooks/useResizeObserver';

const block = cn('navigation-description');

type Props = {
    className?: string;
};

function NavigationDescription({className}: Props) {
    const dispatch = useDispatch();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const edittingAnnotation = useSelector(getEdittingAnnotation);
    const editMode = useSelector(getEditMode);

    const {expanded, toggleExpanded} = useDescriptionCollapse();

    const {description, descriptionType, visible} = useDescription();
    const {ytAnnotationPath} = useYTAnnotation();

    const handleResize = useCallback(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 0);
    }, []);

    useResizeObserver({element: wrapperRef.current, onResize: handleResize});

    if (!visible) {
        return null;
    }

    return (
        <div ref={wrapperRef} className={block(null, className)}>
            <CollapsibleSection
                className={block('collapsible', {expanded})}
                name={'Description'}
                collapsed={false}
                size={UI_COLLAPSIBLE_SIZE}
                overview={<NavigationDescriptionOverview />}
            >
                <div className={block('content')}>
                    {editMode && descriptionType === 'yt' ? (
                        <EditAnnotationWithPreview
                            valuePath={ytAnnotationPath}
                            value={{value: edittingAnnotation || ''}}
                            initialValue={{value: edittingAnnotation || ''}}
                            onChange={({value}) =>
                                dispatch(setEdittingAnnotation({edittingAnnotation: value}))
                            }
                            className={block('edit-block')}
                            hideReset
                        />
                    ) : (
                        <AnnotationWithPartial
                            annotation={description}
                            expanded={expanded}
                            onToggle={toggleExpanded}
                        />
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
}

export default NavigationDescription;
