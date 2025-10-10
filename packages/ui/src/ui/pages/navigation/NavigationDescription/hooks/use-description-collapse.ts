import {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {setSettingAnnotationVisibility} from '../../../../store/actions/settings/settings';
import {getSettingAnnotationVisibility} from '../../../../store/selectors/settings';

import {AnnotationVisibility} from '../../../../../shared/constants/settings-ts';

export function useDescriptionCollapse() {
    const dispatch = useDispatch();
    const visibility = useSelector(getSettingAnnotationVisibility);
    const expanded = visibility === AnnotationVisibility.VISIBLE;

    const toggleExpanded = useCallback(() => {
        dispatch(
            setSettingAnnotationVisibility(
                expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE,
            ),
        );
    }, [dispatch, expanded]);

    return {
        expanded,
        toggleExpanded,
    };
}
