import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getDescriptionType,
    setDescriptionType,
} from '../../../../store/reducers/navigation/description';

export function useUpdateDescriptionTypeOnLoad(
    isAnnotationLoadedWithData: boolean,
    isExternalAnnotatonLoadedWithData: boolean,
) {
    const dispatch = useDispatch();

    const descriptionType = useSelector(getDescriptionType);

    useEffect(() => {
        let newDescriptionType: 'yt' | 'external' = descriptionType;

        if (isAnnotationLoadedWithData) {
            newDescriptionType = 'yt';
        } else if (isExternalAnnotatonLoadedWithData) {
            newDescriptionType = 'external';
        }
        if (newDescriptionType !== descriptionType) {
            dispatch(setDescriptionType({descriptionType: newDescriptionType}));
        }
    }, [isAnnotationLoadedWithData, isExternalAnnotatonLoadedWithData]);
}
