import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import {createSelector} from 'reselect';

import i18n from './i18n';

import unipika from '../../../common/thor/unipika';
import ypath from '../../../common/thor/ypath';
import {getConfigData} from '../../../config/ui-settings';
import {Tab} from '../../../constants/navigation/index';
import {type RootState} from '../../../store/reducers';
import {selectCluster} from '../../../store/selectors/global';
import {selectTableMountConfigHasData} from '../../../store/selectors/navigation/content/table-mount-config';
import {selectTabletErrorsBackgroundCount} from '../../../store/selectors/navigation/tabs/tablet-errors-background';
import {type ValueOf, type YTError} from '../../../types';
import UIFactory from '../../../UIFactory';
import {type ParsedPath, prepareNavigationState} from '../../../utils/navigation';
import {isPipelineNode} from '../../../utils/navigation/isPipelineNode';
import {selectAttributes, selectParsedPath, selectPath, selectTransaction} from './index';

export function selectNavigationPathAttributesLoadState(state: RootState) {
    return state.navigation.navigation.loadState;
}

export const selectNavigationPathAttributes = (state: RootState) =>
    state.navigation.navigation.attributes as any;
export const selectNavigationIsWritable = (state: RootState) =>
    state.navigation.navigation.isWriteable as boolean;
export const selectNavigationIsAccountUsable = (state: RootState) =>
    state.navigation.navigation.isAccountUsable as boolean;
export const selectNavigationCheckPermissionsError = (state: RootState) =>
    state.navigation.navigation.checkPermissionsError as YTError | undefined;
export const selectMode = (state: RootState) => state.navigation.navigation.mode;
export const selectNavigationAccessLogAvailable = (state: RootState) =>
    state.navigation.navigation.is_access_log_available;

export const selectNavigationPathAccount = createSelector(
    [selectNavigationPathAttributes],
    (attrs) => attrs.account,
);

export const selectNavigationBreadcrumbs = createSelector(
    [selectPath, selectParsedPath, selectTransaction],
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

export const selectNavigationRestorePath = createSelector(
    [selectNavigationPathAttributes],
    (attrs) => {
        return ypath.getValue(attrs, '/_restore_path');
    },
);

export const selectNavigationOriginatingQueuePath = (state: RootState) =>
    state.navigation.navigation.originatingQueuePath;

export const selectSupportedTabs = createSelector(
    [
        selectNavigationPathAttributes,
        selectTableMountConfigHasData,
        selectTabletErrorsBackgroundCount,
        selectNavigationOriginatingQueuePath,
        selectNavigationAccessLogAvailable,
    ],
    (
        attributes,
        mountConfigHasData,
        tabletErrorsCount,
        originatingQueuePath,
        is_access_log_available,
    ) => {
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
            Boolean(is_access_log_available) && Tab.ACCESS_LOG,
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

export const selectTabs = createSelector(
    [
        selectSupportedTabs,
        selectTabletErrorsBackgroundCount,
        selectAttributes,
        selectNavigationOriginatingQueuePath,
        selectCluster,
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
                title: i18n('title_go-to-consumer'),
                text: i18n('title_consumer'),
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
                title: i18n('title_go-to-content'),
                text: isACO ? i18n('title_principal-acl') : i18n('title_content'),
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
                title: i18n('title_go-to-queue'),
                text: i18n('title_queue'),
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
                title: i18n('title_go-to-attributes'),
                text: i18n('title_attributes'),
                hotkey: [
                    {
                        keys: 'alt+a',
                        tab: Tab.ATTRIBUTES,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.USER_ATTRIBUTES,
                title: i18n('title_go-to-user-attributes'),
                text: i18n('title_user-attributes'),
                hotkey: [
                    {
                        keys: 'alt+u',
                        tab: Tab.USER_ATTRIBUTES,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.MOUNT_CONFIG,
                title: i18n('title_go-to-mount-config'),
                text: i18n('title_mount-config'),
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
                title: i18n('title_go-to-acl'),
                text: 'ACL',
                hotkey: [
                    {
                        keys: 'alt+p',
                        tab: Tab.ACL,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.ACCESS_LOG,
                title: i18n('title_access-log'),
                text: i18n('title_access-log'),
            },
            {
                value: Tab.FLOW,
                title: i18n('title_go-to-flow'),
                text: i18n('title_flow'),
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
                title: i18n('title_go-to-locks'),
                text: i18n('title_locks'),
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
                title: i18n('title_go-to-annotation'),
                text: i18n('title_annotation'),
                hotkey: [
                    {
                        keys: 'alt+n',
                        tab: Tab.ACL,
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.SCHEMA,
                title: i18n('title_go-to-schema'),
                text: i18n('title_schema'),
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
                title: i18n('title_go-to-tablets'),
                text: i18n('title_tablets'),
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
                title: i18n('title_go-to-tablet-errors'),
                text: i18n('title_tablet-errors'),
                counter: tabletErrorsCount > 0 ? tabletErrorsCount : undefined,
            },
            {
                value: Tab.ORIGINATING_QUEUE,
                title: i18n('title_originating-queue'),
                text: i18n('title_originating-queue'),
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

export const selectEffectiveMode = createSelector([selectMode, selectTabs], (mode, tabs) => {
    const [firstTab] = tabs;

    return mode === Tab.AUTO ? firstTab.value : mode;
});
