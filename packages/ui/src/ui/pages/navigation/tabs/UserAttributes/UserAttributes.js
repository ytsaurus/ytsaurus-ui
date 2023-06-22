import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import unipika from '../../../../common/thor/unipika';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import {Loader} from '@gravity-ui/uikit';
import Yson from '../../../../components/Yson/Yson';

import {
    abortAndReset,
    getUserAttributeKeys,
} from '../../../../store/actions/navigation/tabs/user-attributes';
import {getUserAttributes} from '../../../../store/selectors/navigation/tabs/user-attributes';
import {getPath} from '../../../../store/selectors/navigation';
import {getEffectiveMode} from '../../../../store/selectors/navigation/navigation';

import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {calculateLoadingStatus, isFinalLoadingStatus} from '../../../../utils/utils';

import './UserAttributes.scss';

const block = cn('navigation-user-attributes');

function UserAttributes(props) {
    const {path, mode, getUserAttributeKeys, abortAndReset} = props;
    useEffect(() => {
        getUserAttributeKeys();
        return abortAndReset;
    }, [path, mode]);

    const {loading, loaded, userAttributes, settings} = props;
    const initialLoading = loading && !loaded;

    return (
        <LoadDataHandler {...props}>
            <div className={block({loading: initialLoading})}>
                {initialLoading ? (
                    <Loader />
                ) : (
                    <Yson value={userAttributes} settings={settings} folding />
                )}
            </div>
        </LoadDataHandler>
    );
}

UserAttributes.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    userAttributes: PropTypes.object.isRequired,
    settings: Yson.settingsProps.isRequired,
    path: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,

    getUserAttributeKeys: PropTypes.func.isRequired,
    abortAndReset: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData} = state.navigation.tabs.userAttributes;
    const userAttributes = getUserAttributes(state);
    const settings = unipika.prepareSettings();
    const path = getPath(state);
    const mode = getEffectiveMode(state);

    return {
        loading,
        loaded,
        error,
        errorData,

        userAttributes,
        settings,
        path,
        mode,
    };
};

const mapDispatchToProps = {
    getUserAttributeKeys,
    abortAndReset,
};

const UserAttributesConnected = connect(mapStateToProps, mapDispatchToProps)(UserAttributes);

export default function UserAttributesWithRum() {
    const {loaded, error, loading} = useSelector((state) => state.navigation.tabs.userAttributes);
    const loadState = calculateLoadingStatus(loading, loaded, error);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_USER_ATTRIBUTES,
        startDeps: [loading],
        allowStart: ([loading]) => loading,
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_USER_ATTRIBUTES,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <UserAttributesConnected />;
}
