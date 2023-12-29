import React from 'react';
import {connect} from 'react-redux';

import {AccessContentAcl, NavigationAcl} from '../../../../components/ACL/ACL-connect-helpers';
import {getAclLoadState} from '../../../../store/selectors/acl';
import {getAttributes, getRawPath} from '../../../../store/selectors/navigation';
import {IdmObjectType} from '../../../../constants/acl';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';

const AclTabParams = {
    [IdmObjectType.PATH]: {
        rumType: RumMeasureTypes.NAVIGATION_TAB_ACL,
        Component: NavigationAcl,
    },
    [IdmObjectType.ACCESS_CONTROL_OBJECT]: {
        rumType: RumMeasureTypes.NAVIGATION_TAB_ACL_ACCESS,
        Component: AccessContentAcl,
    },
};

const makeComponentWithRum = (idmKind) => {
    const {rumType, Component} = AclTabParams[idmKind];
    const AclTabComponent = (props) => {
        useAppRumMeasureStart({
            type: rumType,
            startDeps: [props.loadState],
            allowStart: ([loadState]) => !isFinalLoadingStatus(loadState),
        });

        useRumMeasureStop({
            type: rumType,
            stopDeps: [props.loadState],
            allowStop: ([loadState]) => {
                return isFinalLoadingStatus(loadState);
            },
        });

        return <Component {...props} />;
    };
    return AclTabComponent;
};

const makeMapStateToProps = (idmKind) => {
    return (state, props) => {
        const attributes = getAttributes(state);
        let {path} = attributes;
        if (!path) path = getRawPath(state);

        const isPrincipalACLtab =
            props.mode === 'content' && props.type === 'access_control_object';

        const aclType = isPrincipalACLtab ? '@principal_acl' : '@acl';

        return {
            loadState: getAclLoadState(state, idmKind),
            path: path,
            aclType,
        };
    };
};

function createACLTabComponent(idmKind) {
    const mapStateToProps = makeMapStateToProps(idmKind);
    const Component = makeComponentWithRum(idmKind);
    return connect(mapStateToProps)(Component);
}

export default createACLTabComponent(IdmObjectType.PATH);
export const AccessAclTab = createACLTabComponent(IdmObjectType.ACCESS_CONTROL_OBJECT);
