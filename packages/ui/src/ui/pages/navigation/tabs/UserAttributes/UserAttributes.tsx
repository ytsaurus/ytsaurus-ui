import React, {useEffect} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import unipika from '../../../../common/thor/unipika';
import cn from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';

import {
    abortAndReset,
    requestUserAttributes,
} from '../../../../store/actions/navigation/tabs/user-attributes';
import {
    selectUserAttributes,
    selectUserAttributesLoadInfo,
} from '../../../../store/selectors/navigation/tabs/user-attributes';
import {selectPath} from '../../../../store/selectors/navigation';
import {selectEffectiveMode} from '../../../../store/selectors/navigation/navigation';

import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';

import {calculateLoadingStatus, isFinalLoadingStatus} from '../../../../utils/utils';
import {pathToFileName} from '../../helpers/pathToFileName';

import './UserAttributes.scss';

const block = cn('navigation-user-attributes');

function UserAttributes() {
    const dispatch = useDispatch();
    const {loading, loaded, error} = useSelector(selectUserAttributesLoadInfo);
    const path = useSelector(selectPath);
    const mode = useSelector(selectEffectiveMode);
    const userAttributes = useSelector(selectUserAttributes);
    const settings = unipika.prepareSettings();

    useEffect(() => {
        dispatch(requestUserAttributes());
        return () => {
            dispatch(abortAndReset);
        };
    }, [path, mode]);

    const initialLoading = loading && !loaded;

    return (
        <LoadDataHandler loaded error={Boolean(error)}>
            <div className={block({loading: initialLoading})}>
                {initialLoading ? (
                    <Loader />
                ) : (
                    <YsonWithScroll
                        value={userAttributes}
                        settings={settings}
                        extraTools={
                            <YsonDownloadButton
                                value={userAttributes}
                                settings={settings}
                                name={`user_attributes_${pathToFileName(path)}`}
                            />
                        }
                    />
                )}
            </div>
        </LoadDataHandler>
    );
}

export default function UserAttributesWithRum() {
    const {loaded, loading, error} = useSelector(selectUserAttributesLoadInfo);
    const loadState = calculateLoadingStatus(Boolean(loading), Boolean(loaded), error);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_USER_ATTRIBUTES,
        startDeps: [loading],
        allowStart: ([loading]) => Boolean(loading),
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_USER_ATTRIBUTES,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <UserAttributes />;
}
