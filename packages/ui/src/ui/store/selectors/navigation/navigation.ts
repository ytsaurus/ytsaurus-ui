import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import {createSelector} from 'reselect';

import unipika from '../../../common/thor/unipika';
import ypath from '../../../common/thor/ypath';
import {getAccessLogBasePath} from '../../../config';
import {getConfigData} from '../../../config/ui-settings';
import {Tab} from '../../../constants/navigation/index';
import type {RootState} from '../../../store/reducers';
import {getCluster} from '../../../store/selectors/global';
import {getTableMountConfigHasData} from '../../../store/selectors/navigation/content/table-mount-config';
import {getTabletErrorsBackgroundCount} from '../../../store/selectors/navigation/tabs/tablet-errors-background';
import type {ValueOf, YTError} from '../../../types';
import UIFactory from '../../../UIFactory';
import {ParsedPath, prepareNavigationState} from '../../../utils/navigation';
import {isPipelineNode} from '../../../utils/navigation/isPipelineNode';
import {getAttributes, getParsedPath, getPath, getTransaction} from './index';

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
            return map_(parsedPath?.fragments, (item, index) => {
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

export const getNavigationOriginatingQueuePath = (state: RootState) =>
    state.navigation.navigation.originatingQueuePath;

export const getSupportedTabs = createSelector(
    [
        getNavigationPathAttributes,
        getTableMountConfigHasData,
        getTabletErrorsBackgroundCount,
        getNavigationOriginatingQueuePath,
    ],
    (attributes, mountConfigHasData, tabletErrorsCount, originatingQueuePath) => {
        const isDynamic = attributes.dynamic === true;
        const isPipeline = isPipelineNode(attributes);
        const mountConfigVisible = mountConfigHasData || isDynamic;
        const alwaysSupportedTabs = compact_([
            Tab.CONTENT,
            isPipeline && Tab.FLOW,
            Tab.ATTRIBUTES,
            Tab.USER_ATTRIBUTES,
            mountConfigVisible && Tab.MOUNT_CONFIG,
            Tab.ACL,
            Boolean(getAccessLogBasePath()) && Tab.ACCESS_LOG,
        ]);
        const supportedByAttribute = filter_<ValueOf<typeof Tab>>(
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

        const schema = ypath.getValue(attributes?.schema);
        const hasSortedColumns = schema?.some((item: {sort_order?: unknown}) => {
            return Boolean(item.sort_order);
        });

        if (
            attributes?.dynamic === true &&
            schema?.length > 0 &&
            !hasSortedColumns &&
            (attributes?.type === 'table' ||
                attributes?.type === 'replicated_table' ||
                attributes?.type === 'chaos_replicated_table')
        ) {
            supportedByAttribute.push(Tab.QUEUE);
        }

        if (attributes?.type == 'queue_consumer' || attributes?.treat_as_queue_consumer == true) {
            supportedByAttribute.push(Tab.CONSUMER);
        }

        if (originatingQueuePath) {
            supportedByAttribute.push(Tab.ORIGINATING_QUEUE);
        }

        let supportedTabletErrors: Array<ValueOf<typeof Tab>> = [];
        if (
            tabletErrorsCount > 0 ||
            (getConfigData().allowTabletErrorsAPI && attributes.tablet_error_count >= 0)
        ) {
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
    [
        getSupportedTabs,
        getTabletErrorsBackgroundCount,
        getAttributes,
        getNavigationOriginatingQueuePath,
        getCluster,
    ],
    (supportedTabs, tabletErrorsCount, attributes, originatingQueuePath, cluster) => {
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
            url?: string;
            external?: boolean;
            routed?: false;
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
                value: Tab.FLOW,
                title: 'Go to content [Alt+F]',
                text: 'Flow',
                hotkey: [
                    {
                        keys: 'alt+f',
                        tab: Tab.FLOW,
                        scope: 'all',
                    },
                ],
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
                counter: tabletErrorsCount > 0 ? tabletErrorsCount : undefined,
            },
            {
                value: Tab.ORIGINATING_QUEUE,
                title: 'Originating queue',
                url: `${window.location.origin}/${cluster}/navigation?path=${originatingQueuePath}`,
                external: true,
                routed: false,
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
