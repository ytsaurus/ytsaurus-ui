import {useMemo} from 'react';

import {requestAttribute} from '../../../../store/actions/navigation/tabs/attributes/attributes';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectLoadableAttributesRequestsState,
    selectOpaqueAttributeKeysSet,
} from '../../../../store/selectors/navigation/tabs/attributes';

export type LoadablePathState = {
    loading?: boolean;
    loaded?: boolean;
};

export type GetIsPathLoadable = (ypath: string) => boolean;

export type GetLoadablePathState = (ypath: string) => LoadablePathState;

export type OnRequestLoadPath = (ypath: string) => void;

export const useLoadableAttributesHandlers = (): {
    getIsPathLoadable: GetIsPathLoadable;
    getLoadablePathState: GetLoadablePathState;
    onRequestLoadPath: OnRequestLoadPath;
} => {
    const dispatch = useDispatch();

    const opaqueAttributeKeysSet = useSelector(selectOpaqueAttributeKeysSet);
    const loadableAttributeStates = useSelector(selectLoadableAttributesRequestsState);

    return useMemo(() => {
        const getIsPathLoadable: GetIsPathLoadable = (ypath) => {
            return opaqueAttributeKeysSet.has(ypath);
        };

        const getLoadablePathState: GetLoadablePathState = (ypath) => {
            return loadableAttributeStates[ypath] ?? {};
        };

        const onRequestLoadPath: OnRequestLoadPath = (ypath) => {
            return dispatch(requestAttribute(ypath));
        };

        return {
            getIsPathLoadable,
            getLoadablePathState,
            onRequestLoadPath,
        };
    }, [dispatch, opaqueAttributeKeysSet, loadableAttributeStates]);
};
