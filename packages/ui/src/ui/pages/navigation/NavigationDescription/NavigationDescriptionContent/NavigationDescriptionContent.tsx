import cn from 'bem-cn-lite';
import {createErrorFromData} from '../../../../../shared/utils/error';
import Loader from '../../../../components/Loader/Loader';
import {LOADING_STATUS} from '../../../../constants';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import {selectError, selectLoadState, selectPath} from '../../../../store/selectors/navigation';
import {selectCluster} from '../../../../store/selectors/global';
import {NavigationError} from '../../Navigation/NavigationError';
import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {
    getEditMode,
    getEdittingAnnotation,
    setEdittingAnnotation,
} from '../../../../store/reducers/navigation/description';

import {EditAnnotationWithPreview} from '../../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';

import {useDescription} from '../hooks/use-description';
import {useDescriptionCollapse} from '../hooks/use-description-collapse';
import {useYTAnnotation} from '../hooks/use-yt-annotation';

import {AnnotationWithPartial} from '../AnnotationWithPartial';

const block = cn('navigation-description');

export function NavigationDescriptionContent() {
    const dispatch = useDispatch();

    const edittingAnnotation = useSelector(getEdittingAnnotation);
    const editMode = useSelector(getEditMode);

    const {expanded, toggleExpanded} = useDescriptionCollapse();

    const {description, loading, error, descriptionType} = useDescription();
    const navigationError = useSelector(selectError);
    const navigationLoadState = useSelector(selectLoadState);
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);
    const {ytAnnotationPath} = useYTAnnotation();

    if (loading) {
        return <Loader visible />;
    }
    if (error) {
        if (
            descriptionType === 'yt' &&
            navigationError &&
            navigationLoadState === LOADING_STATUS.ERROR
        ) {
            return (
                <NavigationError cluster={cluster} path={path} details={navigationError.details} />
            );
        }
        const details = error instanceof Error ? error : createErrorFromData(error);
        return <YTErrorBlock error={details} />;
    }
    if (editMode) {
        return (
            <EditAnnotationWithPreview
                valuePath={ytAnnotationPath}
                value={{value: edittingAnnotation || ''}}
                initialValue={{value: edittingAnnotation || ''}}
                onChange={({value}) => dispatch(setEdittingAnnotation({edittingAnnotation: value}))}
                className={block('edit-block')}
                hideReset
            />
        );
    }
    if (!description) {
        return null;
    }
    return (
        <AnnotationWithPartial
            annotation={description}
            expanded={expanded}
            onToggle={toggleExpanded}
        />
    );
}
