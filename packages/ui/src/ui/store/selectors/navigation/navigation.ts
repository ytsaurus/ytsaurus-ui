import _ from 'lodash';
import {createSelector} from 'reselect';

import ypath from '../../../common/thor/ypath';
import unipika from '../../../common/thor/unipika';

import type {RootState} from '../../../store/reducers';
import type {ValueOf, YTError} from '../../../types';
import {getAttributes, getParsedPath, getPath, getTransaction} from './index';
import {ParsedPath, prepareNavigationState} from '../../../utils/navigation';
import {Tab} from '../../../constants/navigation/index';

import {getTableMountConfigHasData} from '../../../store/selectors/navigation/content/table-mount-config';
import {getAccessLogBasePath} from '../../../config';
import {getTabletErrorsCount} from '../../../store/selectors/navigation/tabs/tablet-errors';
import UIFactory from '../../../UIFactory';

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
    [getNavigationPathAttributes, getTableMountConfigHasData, getTabletErrorsCount],
    (attributes, mountConfigHasData, tabletErrorsCount) => {
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
            attributes?.type === 'table' &&
            attributes?.dynamic === true &&
            attributes?.sorted === false
        ) {
            supportedByAttribute.push(Tab.QUEUE);
        }

        if (attributes?.type == 'queue_consumer' || attributes?.treat_as_queue_consumer == true) {
            supportedByAttribute.push(Tab.CONSUMER);
        }

        let supportedTabletErrors: Array<ValueOf<typeof Tab>> = [];
        if (tabletErrorsCount > 0) {
            supportedTabletErrors = [Tab.TABLET_ERRORS];
        }

        const supportedTabs = new Set<string>([
            ...alwaysSupportedTabs,
            ...supportedByAttribute,
            ...supportedTabletErrors,
        ]);

        UIFactory.getNavigationExtraTabs().forEach((tab) => {
            if (tab.isSupported(attributes)) {
                supportedTabs.add(tab.value);
            }
        });

        return supportedTabs;
    },
);

export const getTabs = createSelector(
    [getSupportedTabs, getTabletErrorsCount, getAttributes],
    (supportedTabs, tabletErrorsCount, attributes) => {
        const isACO = attributes?.type === 'access_control_object';

        const tabs: {
            value: string;
            title: string;
            hotkey?: {
                keys: string;
                tab: string;
                scope: string;
            }[];
            text?: string;
            caption?: string;
            counter?: number;
        }[] = [
            {
                value: Tab.CONSUMER,
                title: 'Go to consumer [Alt+R]',
                hotkey: [
                    {
                        keys: 'alt+r',
                        tab: Tab.CONSUMER,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.CONTENT,
                title: 'Go to content [Alt+C]',
                text: isACO ? 'Principal ACL' : undefined,
                hotkey: [
                    {
                        keys: 'alt+c',
                        tab: Tab.CONTENT,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.QUEUE,
                title: 'Go to queue [Alt+Q]',
                hotkey: [
                    {
                        keys: 'alt+q',
                        tab: Tab.QUEUE,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.ATTRIBUTES,
                title: 'Go to attributes [Alt+A]',
                hotkey: [
                    {
                        keys: 'alt+a',
                        tab: Tab.ATTRIBUTES,
                        scope: 'all',
                    },
                ],
                caption: 'Attributes',
            },
            {
                value: Tab.USER_ATTRIBUTES,
                title: 'Go to user attributes [Alt+U]',
                hotkey: [
                    {
                        keys: 'alt+u',
                        tab: Tab.USER_ATTRIBUTES,
                        scope: 'all',
                    },
                ],
                caption: 'User Attributes',
            },
            {
                value: Tab.MOUNT_CONFIG,
                title: 'Go to mount config',
                hotkey: [
                    {
                        keys: 'alt+m',
                        tab: Tab.MOUNT_CONFIG,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.ACL,
                title: 'Go to ACL [Alt+P]',
                hotkey: [
                    {
                        keys: 'alt+p',
                        tab: Tab.ACL,
                        scope: 'all',
                    },
                ],
                caption: 'ACL',
            },
            {
                value: Tab.ACCESS_LOG,
                title: 'Access log',
            },
            {
                value: Tab.LOCKS,
                title: 'Go to locks [Alt+L]',
                hotkey: [
                    {
                        keys: 'alt+l',
                        tab: Tab.LOCKS,
                        scope: 'all',
                    },
                ],
                counter: ypath.getValue(attributes, '/lock_count'),
            },
            {
                value: Tab.ANNOTATION,
                title: 'Go to annotation [Alt+N]',
                hotkey: [
                    {
                        keys: 'alt+n',
                        tab: Tab.ACL,
                        scope: 'all',
                    },
                ],
                caption: 'Annotation',
            },
            {
                value: Tab.SCHEMA,
                title: 'Go to schema [Alt+S]',
                hotkey: [
                    {
                        keys: 'alt+s',
                        tab: Tab.SCHEMA,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.TABLETS,
                title: 'Go to tablets [Alt+T]',
                hotkey: [
                    {
                        keys: 'alt+t',
                        tab: Tab.TABLETS,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.TABLET_ERRORS,
                title: 'Go to tablets errors',
                counter: tabletErrorsCount,
            },
        ];

        UIFactory.getNavigationExtraTabs().forEach((extraTab) => {
            for (let i = 0; i < tabs.length; i++) {
                let indexOffset = 0;
                let tabToFind;

                if ('before' in extraTab.position) {
                    tabToFind = extraTab.position.before;
                }

                if ('after' in extraTab.position) {
                    tabToFind = extraTab.position.after;
                    indexOffset = 1;
                }

                if (tabs[i].value === tabToFind) {
                    const newTab = {
                        value: extraTab.value,
                        title: extraTab.title,
                        hotkey: extraTab.hotkey
                            ? [{keys: extraTab.hotkey, tab: extraTab.value, scope: 'all'}]
                            : undefined,
                        text: extraTab.text,
                        caption: extraTab.caption,
                    };
                    tabs.splice(i + indexOffset, 0, newTab);
                    break;
                }
            }
        });

        return tabs.filter((tab) => supportedTabs.has(tab.value));
    },
);

export const getEffectiveMode = createSelector([getMode, getTabs], (mode, tabs) => {
    const [firstTab] = tabs;

    return mode === Tab.AUTO ? firstTab.value : mode;
});
