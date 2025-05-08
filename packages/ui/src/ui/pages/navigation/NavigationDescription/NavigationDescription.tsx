import React from 'react';
import {useDispatch} from 'react-redux';
import cn from 'bem-cn-lite';

import {setEdittingAnnotation} from '../../../store/reducers/navigation/navigation-description';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {EditAnnotationWithPreview} from '../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';

import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {useDescription} from './hooks/use-description';

import {NavigationDescriptionOverview} from './NavigationDescriptionOverview';
import {AnnotationWithPartial} from './AnnotationWithPartial';

import './NavigationDescription.scss';

const block = cn('navigation-description');

type Props = {
    className?: string;
};

function NavigationDescription({className}: Props) {
    const dispatch = useDispatch();

    const {
        annotation,
        ytAnnotationPath,
        expanded,
        toggleExpanded,
        editMode,
        edittingAnnotation,
        visible,
    } = useDescription();

    if (!visible) {
        return null;
    }

    return (
        <div className={block(null, className)}>
            <CollapsibleSection
                className={block('collapsible', {expanded})}
                name={'Description'}
                collapsed={false}
                size={UI_COLLAPSIBLE_SIZE}
                overview={<NavigationDescriptionOverview />}
            >
                <div className={block('content')}>
                    {editMode ? (
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
                            annotation={annotation}
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
