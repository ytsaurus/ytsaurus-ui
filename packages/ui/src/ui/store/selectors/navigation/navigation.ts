import _ from 'lodash';
import {createSelector} from 'reselect';

import ypath from '../../../common/thor/ypath';
import unipika from '../../../common/thor/unipika';

import type {RootState} from '../../../store/reducers';
import type {ValueOf, YTError} from '../../../types';
import {getParsedPath, getPath, getTransaction} from './index';
import {ParsedPath, prepareNavigationState} from '../../../utils/navigation';
import {Tab} from '../../../constants/navigation/index';

import {isDeveloper as getIsDeveloper} from '../../../store/selectors/global';
import {getTableMountConfigHasData} from '../../../store/selectors/navigation/content/table-mount-config';
import {getAccessLogBasePath} from '../../../config';
import {getTabletErrorsCount} from '../../../store/selectors/navigation/tabs/tablet-errors';

export function getNavigationPathAttributesLoadState(state: RootState) {
    return state.navigation.navigation.loadState;
}

export const getNavigationPathAttributes = (state: RootState) =>
    state.navigation.navigation.attributes as any;
export const getNavigationIsWritable = (state: RootState) =>
    state.navigation.navigation.isWriteable as boolean;
export const getNavigationIsAccountUsable = (state: RootState) =>
    state.navigation.navigation.isAccountUsable as boolean;
export const getNavigationCheckPermissionsError = (state: RootState) =>
    state.navigation.navigation.checkPermissionsError as YTError | undefined;
export const getMode = (state: RootState) => state.navigation.navigation.mode;

export const getNavigationPathAccount = createSelector(
    [getNavigationPathAttributes],
    (attrs) => attrs.account,
);

export const getNavigationBreadcrumbs = createSelector(
    [getPath, getParsedPath, getTransaction],
    (path: string, parsedPath?: ParsedPath, transaction?: string) => {
        if (parsedPath) {
            return _.map(parsedPath?.fragments, (item, index) => {
                return {
                    text: item.name,
                    state: prepareNavigationState(parsedPath, transaction, index),
                };
            });
        } else {
            return [
                {
                    text: prepareBrokenPath(path),
                    state: prepareNavigationState(path, transaction),
                },
            ];
        }
    },
);

function prepareBrokenPath(path: string): string {
    return unipika.prettyprint(path, {
        break: false,
        indent: 0,
        binaryAsHex: false,
    });
}

export const getNavigationRestorePath = createSelector([getNavigationPathAttributes], (attrs) => {
    return ypath.getValue(attrs, '/_restore_path');
});

export const getSupportedTabs = createSelector(
    [getNavigationPathAttributes, getTableMountConfigHasData, getTabletErrorsCount, getIsDeveloper],
    (attributes, mountConfigHasData, tabletErrorsCount, isDeveloper) => {
        const isDynamic = attributes.dynamic === true;
        const mountConfigVisible = mountConfigHasData || isDynamic;
        const alwaysSupportedTabs = _.compact([
            Tab.CONTENT,
            Tab.ATTRIBUTES,
            Tab.USER_ATTRIBUTES,
            mountConfigVisible && Tab.MOUNT_CONFIG,
            Tab.ACL,
            Boolean(getAccessLogBasePath()) && Tab.ACCESS_LOG,
        ]);
        const supportedByAttribute = _.filter<ValueOf<typeof Tab>>(
            [Tab.SCHEMA, Tab.LOCKS],
            // eslint-disable-next-line no-prototype-builtins
            (name) => attributes?.hasOwnProperty(name),
        );

        if (
            (attributes?.type === 'table' && attributes?.dynamic === true) ||
            attributes?.type === 'replicated_table' ||
            attributes?.type === 'replication_log_table'
        ) {
            supportedByAttribute.push(Tab.TABLETS);
        }

        if (
            isDeveloper &&
            attributes?.type === 'table' &&
            attributes?.dynamic === true &&
            attributes?.sorted === false
        ) {
            supportedByAttribute.push(Tab.QUEUE);
        }

        if (
            isDeveloper &&
            (attributes?.type == 'queue_consumer' || attributes?.treat_as_queue_consumer == true)
        ) {
            supportedByAttribute.push(Tab.CONSUMER);
        }

        let supportedTabletErrors: Array<ValueOf<typeof Tab>> = [];
        if (tabletErrorsCount > 0) {
            supportedTabletErrors = [Tab.TABLET_ERRORS];
        }

        return new Set([...alwaysSupportedTabs, ...supportedByAttribute, ...supportedTabletErrors]);
    },
);

export const getDefaultMode = createSelector([getSupportedTabs], (supportedTabs) =>
    supportedTabs.has(Tab.CONSUMER) ? Tab.CONSUMER : Tab.CONTENT,
);

export const getEffectiveMode = createSelector([getMode, getDefaultMode], (mode, defaultMode) =>
    mode === Tab.AUTO ? defaultMode : mode,
);
