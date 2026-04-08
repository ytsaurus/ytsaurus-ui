import React from 'react';
import {useSelector} from '../../store/redux-hooks';
import {IconProps} from '@gravity-ui/uikit';

import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import {produce} from 'immer';

import UIFactory from '../../UIFactory';

import generalIcon from '../../assets/img/svg/tools-icon.svg';
import paletteIcon from '../../assets/img/svg/palette-icon.svg';
import closeTagIcon from '../../assets/img/svg/close-tag-icon.svg';
import dataIcon from '../../assets/img/svg/data-icon.svg';
import systemIcon from '../../assets/img/svg/page-system.svg';
import {mastersRadioButtonItems} from '../../constants/system/masters';
import operationsIcon from '../../assets/img/svg/page-operations.svg';
import componentsIcon from '../../assets/img/svg/page-components.svg';
import navigationIcon from '../../assets/img/svg/page-navigation.svg';
import shieldIcon from '../../assets/img/svg/shield-icon.svg';
import tableIcon from '../../assets/img/svg/table-icon.svg';
import infoIcon from '../../assets/img/svg/info-icon.svg';
import LogoGitlabIcon from '@gravity-ui/icons/svgs/logo-gitlab.svg';
import PencilToSquareIcon from '@gravity-ui/icons/svgs/pencil-to-square.svg';
import {useClusterFromLocation} from '../../hooks/use-cluster';
import {docsUrl} from '../../config/index';
import {uiSettings} from '../../config/ui-settings';

import ypath from '../../common/thor/ypath';

import {AGGREGATOR_RADIO_ITEMS} from '../../constants/operations/statistics';
import {NAMESPACES, SettingName} from '../../../shared/constants/settings';
import {getRecentPagesInfo} from '../../store/selectors/slideoutMenu';
import {getCurrentClusterNS} from '../../store/selectors/settings/settings-ts';
import SettingsMenuItem from '../../containers/SettingsMenu/SettingsMenuItem';
import SettingsMenuRadio from '../../containers/SettingsMenu/SettingsMenuRadio';
import SettingsMenuInput from '../SettingsMenu/SettingsMenuInput';
import {
    selectCurrentUserName,
    selectGlobalMasterVersion,
    selectGlobalSchedulerVersion,
    selectHttpProxyVersion,
} from '../../store/selectors/global';
import {selectIsDeveloperOrWatchmen} from '../../store/selectors/global/is-developer';
import {
    cellSizeRadioButtonItems,
    pageSizeRadioButtonItems,
} from '../../constants/navigation/content/table';
import {YT} from '../../config/yt-config';
import Link from '../../components/Link/Link';
import Button from '../../components/Button/Button';
import {AddVcsTokenForm, VcsList} from '../../pages/query-tracker/Vcs/SettingsMenu';
import {selectIsVcsVisible, selectVcsConfig} from '../../store/selectors/query-tracker/vcs';
import {SettingsMenuRadioByKey} from '../SettingsMenu/SettingsMenuSelect';
import {BooleanSettingItem} from '../SettingsMenu/BooleanSettingItem';
import {queriesPage} from './queriesPage';

import i18n from './i18n';

export interface SettingsPage {
    title: string;
    icon: IconProps;
    sections: Array<SettingsSection>;
}

export interface SettingsSection {
    title: string;
    items: Array<SettingsItem>;
}

export interface SettingsItem {
    id: string;
    title: string;
    align?: 'top' | 'center';
    content: React.ReactNode;
}

const {oauthTokenUrl} = uiSettings;

const StartPageSettingMemo = React.memo(StartPageSetting);

function wrapEscapeText(text: string) {
    return `<span class="unipika"><span class="escape">${text}</span></span>`;
}

function useSettings(cluster: string, isAdmin: boolean): Array<SettingsPage> {
    const clusterNS = useSelector(getCurrentClusterNS);

    const httpProxyVersion = useSelector(selectHttpProxyVersion);
    const schedulerVersion = useSelector(selectGlobalSchedulerVersion);
    const masterVersion = useSelector(selectGlobalMasterVersion);
    const vcsConfig = useSelector(selectVcsConfig);
    const isVcsVisible = useSelector(selectIsVcsVisible);
    const hasQuerySuggestions = Boolean(UIFactory.getInlineSuggestionsApi());

    return compact_([
        makePage(i18n('title_general'), generalIcon, [
            makeItem('startPage', i18n('field_start-page'), 'top', <StartPageSettingMemo />),
            makeItem(
                'global::newDashboardPage',
                i18n('field_new-dashboard-page'),
                'top',
                <BooleanSettingItem
                    settingKey={'global::newDashboardPage'}
                    description={i18n('context_new-dashboard-page-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.GLOBAL.AUTO_REFRESH,
                i18n('field_auto-refresh'),
                'top',
                <SettingsMenuItem
                    settingName={SettingName.GLOBAL.AUTO_REFRESH}
                    settingNS={NAMESPACES.GLOBAL}
                    annotation={i18n('context_auto-refresh-description')}
                    oneLine={true}
                />,
            ),
            makeItem(
                SettingName.MENU.RECENT_CLUSTER_FIRST,
                i18n('field_recent-clusters'),
                'top',
                <SettingsMenuItem
                    settingName={SettingName.MENU.RECENT_CLUSTER_FIRST}
                    settingNS={NAMESPACES.MENU}
                    annotation={i18n('context_recent-clusters-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.MENU.RECENT_PAGE_FIRST,
                i18n('field_recent-pages'),
                'top',
                <SettingsMenuItem
                    settingName={SettingName.MENU.RECENT_PAGE_FIRST}
                    settingNS={NAMESPACES.MENU}
                    annotation={i18n('context_recent-pages-description')}
                    oneLine
                />,
            ),
        ]),
        makePage(i18n('title_appearance'), paletteIcon, [
            makeItem(
                SettingName.GLOBAL.THEME,
                i18n('field_theme'),
                'top',
                <SettingsMenuRadio
                    settingName={SettingName.GLOBAL.THEME}
                    settingNS={NAMESPACES.GLOBAL}
                    items={[
                        {value: 'light', text: i18n('value_theme-light')},
                        {value: 'dark', text: i18n('value_theme-dark')},
                        {value: 'system', text: i18n('value_theme-system')},
                    ]}
                />,
            ),
            makeItem(
                SettingName.A11Y.USE_SAFE_COLORS,
                i18n('field_contrast'),
                'top',
                <SettingsMenuRadio
                    settingName={SettingName.A11Y.USE_SAFE_COLORS}
                    settingNS={NAMESPACES.A11Y}
                    convertValue={(value) => value === 'true'}
                    items={[
                        {value: 'false', text: i18n('value_contrast-normal')},
                        {value: 'true', text: i18n('value_contrast-high')},
                    ]}
                />,
            ),
            {
                id: 'global::maxContentWidth',
                title: i18n('field_content-width'),
                align: 'top',
                content: (
                    <SettingsMenuRadioByKey
                        settingKey="global::maxContentWidth"
                        options={[
                            {value: 'standard', content: i18n('value_width-standard')},
                            {value: 'wide', content: i18n('value_width-wide')},
                            {value: 'maximum', content: i18n('value_width-maximum')},
                        ]}
                    />
                ),
            },
        ]),
        isAdmin &&
            makePage(
                i18n('title_development'),
                closeTagIcon,
                compact_([
                    makeItem(
                        SettingName.DEVELOPMENT.REGULAR_USER_UI,
                        i18n('field_regular-user-ui'),
                        'top',
                        <SettingsMenuItem
                            settingName={SettingName.DEVELOPMENT.REGULAR_USER_UI}
                            settingNS={NAMESPACES.DEVELOPMENT}
                            label={i18n('field_regular-user-ui')}
                            annotation={i18n('context_regular-user-ui-description')}
                        />,
                    ),
                    makeItem(
                        'global::lang',
                        i18n('field_language'),
                        'top',
                        <SettingsMenuRadioByKey
                            settingKey="global::lang"
                            options={[
                                {value: 'en', content: 'English'},
                                {value: 'ru', content: 'Русский'},
                            ]}
                        />,
                    ),
                    makeItem(
                        'global::development::showAiChat',
                        i18n('field_ai-chat'),
                        'top',
                        <BooleanSettingItem
                            settingKey="global::development::showAiChat"
                            description={i18n('context_ai-chat-description')}
                            oneLine
                        />,
                    ),
                ]),
            ),

        makePage(i18n('title_data'), dataIcon, [
            makeItem(
                SettingName.YSON.FORMAT,
                i18n('field_data-format'),
                'top',
                <SettingsMenuRadio
                    settingName={SettingName.YSON.FORMAT}
                    settingNS={NAMESPACES.YSON}
                    items={[
                        {
                            value: 'yson',
                            text: 'YSON',
                        },
                        {
                            value: 'json',
                            text: 'JSON',
                        },
                        {
                            value: 'raw-json',
                            text: 'Raw JSON',
                        },
                    ]}
                />,
            ),
            makeItem(
                SettingName.YSON.SHOW_DECODED,
                i18n('field_decode-utf8'),
                'top',
                <SettingsMenuItem
                    oneLine={true}
                    settingName={SettingName.YSON.SHOW_DECODED}
                    settingNS={NAMESPACES.YSON}
                    annotation={i18n('context_decode-utf8-description')}
                    annotationHighlight={i18n('context_decode-utf8-highlight')}
                />,
            ),
            makeItem(
                SettingName.YSON.BINARY_AS_HEX,
                i18n('field_binary-as-hex'),
                'top',
                <SettingsMenuItem
                    settingName={SettingName.YSON.BINARY_AS_HEX}
                    settingNS={NAMESPACES.YSON}
                    annotation={i18n('context_binary-as-hex-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.YSON.ESCAPE_WHITESPACES,
                i18n('field_escape-and-highlight'),
                'top',
                <SettingsMenuItem
                    settingName={SettingName.YSON.ESCAPE_WHITESPACES}
                    settingNS={NAMESPACES.YSON}
                    annotation={i18n('context_escape-whitespaces-description', {
                        n: wrapEscapeText('\\n'),
                        t: wrapEscapeText('\\t'),
                    })}
                    annotationHighlight={i18n('context_escape-whitespaces-highlight')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.YSON.COMPACT,
                i18n('field_compact-view'),
                'top',
                <SettingsMenuItem
                    settingName={SettingName.YSON.COMPACT}
                    settingNS={NAMESPACES.YSON}
                    annotation={i18n('context_compact-view-description')}
                    oneLine
                />,
            ),
        ]),
        makePage(i18n('title_system'), systemIcon, [
            makeItem(
                SettingName.SYSTEM.MASTERS_HOST_TYPE,
                i18n('field_host-type'),
                'top',
                <SettingsMenuRadio
                    description={i18n('context_host-type-description')}
                    settingName={SettingName.SYSTEM.MASTERS_HOST_TYPE}
                    settingNS={NAMESPACES.SYSTEM}
                    items={mastersRadioButtonItems}
                />,
            ),
        ]),
        makePage(i18n('title_operation'), operationsIcon, [
            makeItem(
                SettingName.OPERATIONS.STATISTICS_AGGREGATION_TYPE,
                i18n('field_statistics-type'),
                'top',
                <SettingsMenuRadio
                    description={i18n('context_statistics-type-description')}
                    settingName={SettingName.OPERATIONS.STATISTICS_AGGREGATION_TYPE}
                    settingNS={NAMESPACES.OPERATIONS}
                    items={AGGREGATOR_RADIO_ITEMS}
                />,
            ),
        ]),
        makePage(
            i18n('title_navigation'),
            navigationIcon,
            compact_([
                clusterNS &&
                    makeItem(
                        SettingName.LOCAL.NAVIGATION_DEFAULT_PATH,
                        i18n('field_default-path'),
                        'top',
                        <SettingsMenuInput
                            placeholder={i18n('context_default-path-placeholder')}
                            description={i18n('context_default-path-description')}
                            validator={navigationPathValidator}
                            settingName={SettingName.LOCAL.NAVIGATION_DEFAULT_PATH}
                            settingNS={clusterNS}
                        />,
                    ),
                makeItem(
                    SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS,
                    i18n('field_default-chyt-alias'),
                    'top',
                    <SettingsMenuInput
                        placeholder={i18n('context_default-chyt-alias-placeholder')}
                        description={i18n('context_default-chyt-alias-description')}
                        validator={chytAliasValidator}
                        settingName={SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS}
                        settingNS={NAMESPACES.NAVIGATION}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.USE_SMART_SORT,
                    i18n('field_smart-sort'),
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.USE_SMART_SORT}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={i18n('context_smart-sort-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.GROUP_NODES,
                    i18n('field_group-nodes'),
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.GROUP_NODES}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={i18n('context_group-nodes-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.USE_SMART_FILTER,
                    i18n('field_smart-filter'),
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.USE_SMART_FILTER}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={i18n('context_smart-filter-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION,
                    i18n('field_path-autocorrection'),
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={
                            i18n('context_path-autocorrection-description') +
                            docsUrl(
                                'For details see ' +
                                    `<a class="link link_theme_normal" href="${UIFactory.docsUrls['faq:enablepathautocorrection']}" target="_blank">FAQ</a>` +
                                    '.',
                            )
                        }
                        oneLine
                    />,
                ),
            ]),
        ),
        makePageBySections(i18n('title_components'), componentsIcon, [
            {
                title: i18n('title_general'),
                items: [
                    makeItem(
                        SettingName.COMPONENTS.ENABLE_SIDE_BAR,
                        i18n('field_enable-side-bar'),
                        'top',
                        <SettingsMenuItem
                            settingName={SettingName.COMPONENTS.ENABLE_SIDE_BAR}
                            settingNS={NAMESPACES.COMPONENTS}
                            annotation={i18n('context_enable-side-bar-description')}
                            oneLine={true}
                        />,
                    ),
                ],
            },
            {
                title: i18n('title_memory-popup'),
                items: [
                    makeItem(
                        'global::components::memoryPopupShowAll',
                        i18n('field_show-empty-categories'),
                        'top',
                        <BooleanSettingItem
                            settingKey="global::components::memoryPopupShowAll"
                            description={i18n('context_show-empty-categories-description')}
                            oneLine
                        />,
                    ),
                ],
            },
        ]),

        makePage(
            i18n('title_table'),
            tableIcon,
            compact_([
                makeItem(
                    SettingName.DEVELOPMENT.YQL_TYPES,
                    i18n('field_yql-v3-types'),
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.DEVELOPMENT.YQL_TYPES}
                        settingNS={NAMESPACES.DEVELOPMENT}
                        qa="settings_yql-v3-types"
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ROWS_PER_TABLE_PAGE,
                    i18n('field_rows-per-page'),
                    'top',
                    <SettingsMenuRadio
                        description={i18n('context_rows-per-page-description')}
                        settingName={SettingName.NAVIGATION.ROWS_PER_TABLE_PAGE}
                        settingNS={NAMESPACES.NAVIGATION}
                        items={[
                            {
                                value: String(10),
                                text: '10',
                            },
                            {
                                value: String(50),
                                text: '50',
                            },
                            {
                                value: String(100),
                                text: '100',
                            },
                            {
                                value: String(200),
                                text: '200',
                            },
                        ]}
                        convertValue={Number}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.MAXIMUM_TABLE_STRING_SIZE,
                    i18n('field_cell-size-limit'),
                    'top',
                    <SettingsMenuRadio
                        description={i18n('context_cell-size-limit-description')}
                        settingName={SettingName.NAVIGATION.MAXIMUM_TABLE_STRING_SIZE}
                        settingNS={NAMESPACES.NAVIGATION}
                        items={cellSizeRadioButtonItems}
                        convertValue={Number}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT,
                    i18n('field_default-column-limit'),
                    'top',
                    <SettingsMenuRadio
                        description={i18n('context_default-column-limit-description')}
                        settingName={SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT}
                        settingNS={NAMESPACES.NAVIGATION}
                        items={pageSizeRadioButtonItems}
                        convertValue={Number}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY,
                    i18n('field_guess-visible-columns'),
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={i18n('context_guess-visible-columns-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS,
                    i18n('field_raw-strings'),
                    'top',
                    <SettingsMenuItem
                        annotation={i18n('context_raw-strings-description')}
                        settingName={SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS}
                        settingNS={NAMESPACES.NAVIGATION}
                        oneLine
                    />,
                ),
            ]),
        ),

        oauthTokenUrl &&
            makePage(i18n('title_auth'), shieldIcon, [
                makeItem(
                    'oauthToken',
                    i18n('field_oauth-token'),
                    undefined,
                    <Link url={oauthTokenUrl} target="_blank">
                        <Button size={'s'}>{i18n('action_show-token')}</Button>
                    </Link>,
                ),
            ]),

        isVcsVisible &&
            makePage(
                i18n('title_vcs'),
                LogoGitlabIcon,
                compact_([
                    makeItem(
                        'addTokenForm',
                        i18n('action_add-replace-token'),
                        undefined,
                        <AddVcsTokenForm />,
                    ),
                    Boolean(vcsConfig.some((i) => i.hasToken)) &&
                        makeItem(
                            'existingTokenList',
                            i18n('field_existing-tokens'),
                            undefined,
                            <VcsList config={vcsConfig} />,
                        ),
                ]),
            ),

        makePageBySections(i18n('title_editor'), PencilToSquareIcon, [
            {
                title: i18n('title_visual-settings'),
                items: [
                    makeItem(
                        'global::editor::vimMode',
                        i18n('field_vim-mode'),
                        'top',
                        <BooleanSettingItem
                            settingKey="global::editor::vimMode"
                            description={i18n('context_vim-mode-description')}
                            oneLine
                        />,
                    ),
                ],
            },
        ]),
        queriesPage({
            cluster,
            hasQuerySuggestions,
        }),
        makePage(
            i18n('title_about'),
            infoIcon,
            compact_([
                Boolean(cluster) &&
                    makeItem(
                        'httpProxyVersion',
                        i18n('field_http-proxy-version'),
                        undefined,
                        httpProxyVersion,
                    ),
                Boolean(cluster) &&
                    makeItem(
                        'schedulerVersion',
                        i18n('field_scheduler-version'),
                        undefined,
                        schedulerVersion,
                    ),
                Boolean(cluster) &&
                    makeItem(
                        'masterVersion',
                        i18n('field_master-version'),
                        undefined,
                        masterVersion,
                    ),
                makeItem(
                    'interfaceVersion',
                    i18n('field_interface-version'),
                    undefined,
                    YT.parameters.interface.version,
                ),
            ]),
        ),
    ]);
}

export function makePage(
    title: string,
    icon: IconProps | undefined,
    items: Array<SettingsItem>,
): SettingsPage {
    return makePageBySections(title, icon, [{title, items}]);
}

export function makePageBySections(
    title: string,
    icon: IconProps | undefined,
    sections: Array<SettingsSection>,
) {
    return {title, icon: icon || generalIcon, sections};
}

export function makeItem(
    id: string,
    title: string,
    align?: SettingsItem['align'],
    content?: React.ReactNode,
): SettingsItem {
    return {id, title, align, content};
}

export function useSettingsDescription(): Array<SettingsPage> {
    const isAdmin = useSelector(selectIsDeveloperOrWatchmen);
    const cluster = useClusterFromLocation();
    const login = useSelector(selectCurrentUserName);

    const settings = useSettings(cluster, isAdmin);
    const externalSettings = UIFactory.getExternalSettings({cluster, isAdmin, login});

    const res = React.useMemo(() => {
        const extPages: Record<string, SettingsPage> = hashByTitle(externalSettings);
        return produce(settings, (pages) => {
            forEach_(pages, (page) => {
                const extPage = extPages[page.title];
                if (extPage) {
                    delete extPages[page.title];
                    const extSections = hashByTitle(extPage.sections);
                    forEach_(page.sections, (section) => {
                        const s = extSections[section.title];
                        if (s) {
                            delete extSections[section.title];
                            const extIdsMap = new Map(s.items.map((i) => [i.id, i]));
                            const newItems = section.items.filter((i) => !extIdsMap.has(i.id));
                            section.items = [...newItems, ...s.items];
                        }
                    });
                    forEach_(extSections, (section) => {
                        page.sections.push(section);
                    });
                }
            });
            forEach_(extPages, (page) => {
                pages.splice(pages.length - 1, 0, page);
            });
        });
    }, [settings, externalSettings]);

    return res;
}

function hashByTitle<T extends {title: string}>(data: Array<T>) {
    return reduce_(
        data,
        (acc, item) => {
            acc[item.title] = item;
            return acc;
        },
        {} as Record<string, T>,
    );
}

function StartPageSetting() {
    const {all} = useSelector(getRecentPagesInfo);

    const pageItems = React.useMemo(() => {
        const headerPages = filter_(all, (page) => Boolean(page.header));
        return map_(headerPages, (page) => ({
            value: page.id,
            text: page.name,
        }));
    }, [all]);

    return (
        <SettingsMenuRadio
            settingName={SettingName.MENU.STARTING_PAGE}
            settingNS={NAMESPACES.MENU}
            items={pageItems}
        />
    );
}

function navigationPathValidator(value = '/') {
    if (!value) {
        return null;
    }

    try {
        ypath.YPath.create(value, 'absolute');
        return undefined;
    } catch (err) {
        return (err as Error)?.message || 'invalid path';
    }
}

function chytAliasValidator(value: string) {
    if (!value.startsWith('*') && value.length > 0) {
        return "The alias should be started with a character '*'";
    }

    return undefined;
}
