import Consumer from '../../../../../pages/navigation/tabs/Consumer/Consumer';
import Queue from '../../../../../pages/navigation/tabs/Queue/Queue';
import ACL from '../../../../../pages/navigation/tabs/ACL/ACL';
import Locks from '../../../../../pages/navigation/tabs/Locks/Locks';
import Schema from '../../../../../pages/navigation/tabs/Schema/Schema';
import Tablets from '../../../../../pages/navigation/tabs/Tablets/Tablets';
import Attributes from '../../../../../pages/navigation/tabs/Attributes/Attributes';
import AccessLog from '../../../../../pages/navigation/tabs/AccessLog/AccessLog';
import TabletErrors from '../../../../../pages/navigation/tabs/TabletErrors/TabletErrors';
import UserAttributes from '../../../../../pages/navigation/tabs/UserAttributes/UserAttributes';
import TableMountConfig from '../../../../../pages/navigation/tabs/TableMountConfig/TableMountConfig';
import {Tab} from '../../../../../constants/navigation';
import {Fragment} from 'react';
import UIFactory from '../../../../../UIFactory';

const getSupportedAttributeTypes = () => {
    const supportedAttributeTypes: Record<string, React.ComponentType> = {
        acl: ACL,
        locks: Locks,
        schema: Schema,
        tablets: Tablets,
        attributes: Attributes,
        tablet_errors: TabletErrors,
        user_attributes: UserAttributes,
        [Tab.ACCESS_LOG]: AccessLog,
        [Tab.AUTO]: Fragment,
        [Tab.CONSUMER]: Consumer,
        [Tab.MOUNT_CONFIG]: TableMountConfig,
        [Tab.QUEUE]: Queue,
    };

    UIFactory.getNavigationExtraTabs().forEach((tab) => {
        supportedAttributeTypes[tab.value] = tab.component;
    });

    return supportedAttributeTypes;
};

export default (mode: string) => {
    const supportedAttributeTypes = getSupportedAttributeTypes();

    return mode in supportedAttributeTypes
        ? supportedAttributeTypes[mode as keyof typeof supportedAttributeTypes]
        : undefined;
};
