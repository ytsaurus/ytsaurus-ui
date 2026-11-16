import React, {useEffect} from 'react';
import {useHistory, useLocation} from 'react-router';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectPath} from '../../../store/selectors/navigation';
import {selectCluster} from '../../../store/selectors/global';
import {setDescriptionType, startEdit} from '../../../store/reducers/navigation/description';
import {useYTAnnotation} from './hooks/use-yt-annotation';
import cn from 'bem-cn-lite';
import {Flex} from '@gravity-ui/uikit';
import {NavigationDescriptionToolbar} from './NavigationDescriptionToolbar/NavigationDescriptionToolbar';
import {NavigationDescriptionContent} from './NavigationDescriptionContent/NavigationDescriptionContent';
import './NavigationDescription.scss';

const block = cn('navigation-description');

type Props = {
    className?: string;
};

function NavigationDescription({className}: Props) {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation<{editDescription?: {path: string; cluster: string}}>();
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);
    const {ytAnnotation, isAnnotationLoading, annotationError} = useYTAnnotation();
    const editDescription = location.state?.editDescription;

    useEffect(() => {
        if (
            !editDescription ||
            editDescription.path !== path ||
            editDescription.cluster !== cluster ||
            isAnnotationLoading
        ) {
            return;
        }

        history.replace({...location, state: {...location.state, editDescription: undefined}});
        dispatch(setDescriptionType({descriptionType: 'yt'}));
        if (!annotationError && ytAnnotation?.annotation_path === path) {
            dispatch(startEdit({annotation: ytAnnotation}));
        }
    }, [
        editDescription,
        path,
        cluster,
        isAnnotationLoading,
        annotationError,
        ytAnnotation,
        history,
        location,
        dispatch,
    ]);

    return (
        <Flex direction="column" grow={1} gap={3} className={block(null, className)}>
            <NavigationDescriptionToolbar />
            <Flex direction="column" grow={1} className={block('content')}>
                <NavigationDescriptionContent />
            </Flex>
        </Flex>
    );
}

export default NavigationDescription;
