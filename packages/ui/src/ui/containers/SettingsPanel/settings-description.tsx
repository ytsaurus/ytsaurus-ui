import React from 'react';
import {useSelector} from '../../store/redux-hooks';
import compact_ from 'lodash/compact';
import forEach_ from 'lodash/forEach';
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
import {getConfigData, uiSettings} from '../../config/ui-settings';

import ypath from '../../common/thor/ypath';

import {AGGREGATOR_RADIO_ITEMS} from '../../constants/operations/statistics';
import {SettingName} from '../../../shared/constants/settings';
import {STARTING_PAGE_IDS} from '../../../shared/constants/settings-ts';
import {selectRecentPagesInfo} from '../../store/selectors/slideoutMenu';
import {selectCurrentClusterNS} from '../../store/selectors/settings/settings-ts';
import {TextInputSettingItem} from '../SettingsMenu/TextInputSettingItem/TextInputSettingItem';
import {
    selectCurrentUserName,
    selectGlobalMasterVersion,
    selectHttpProxyVersion,
} from '../../store/selectors/global';
import {selectIsDeveloperOrWatchmen} from '../../store/selectors/global/is-developer';
import {
    cellSizeRadioButtonItems,
    pageSizeRadioButtonItems,
} from '../../constants/navigation/content/table';
import {YT} from '../../config/yt-config';
import Link from '../../containers/Link/Link';
import Button from '../../components/Button/Button';
import {AddVcsTokenForm, VcsList} from '../../pages/query-tracker/Vcs/SettingsMenu';
import {selectIsVcsVisible, selectVcsConfig} from '../../store/selectors/query-tracker/vcs';
import {SegmentedRadioGroupSettingItem} from '../SettingsMenu/SettingsMenuSelect';
import {CheckboxSettingItem} from '../SettingsMenu/CheckboxSettingItem';
import {queriesPage} from './queriesPage';
import {type SettingsPage, makeItem, makePage, makePageBySections} from './settings-page-builders';

export {type SettingsPage, makeItem, makePage} from './settings-page-builders';

import i18n from './i18n';

const {oauthTokenUrl} = uiSettings;

const StartPageSettingMemo = React.memo(StartPageSetting);

function wrapEscapeText(text: string) {
    return `<span class="unipika"><span class="escape">${text}</span></span>`;
}

function renderHtmlDescription(description: string, highlight?: string) {
    return (
        <>
            <span dangerouslySetInnerHTML={{__html: description}} />
            {highlight && (
                <>
                    <br />
                    <span
                        className="yt-settings-item-annotation-highlight"
                        dangerouslySetInnerHTML={{__html: highlight}}
                    />
                </>
            )}
        </>
    );
}

function legacyRadioOption<const T>(value: T, text: string) {
    return {value, content: <>{text} </>};
}

function useSettings(cluster: string, isAdmin: boolean): Array<SettingsPage> {
    const clusterNS = useSelector(selectCurrentClusterNS);

    const httpProxyVersion = useSelector(selectHttpProxyVersion);
    const masterVersion = useSelector(selectGlobalMasterVersion);
    const vcsConfig = useSelector(selectVcsConfig);
    const isVcsVisible = useSelector(selectIsVcsVisible);
    const hasQuerySuggestions = Boolean(UIFactory.getInlineSuggestionsApi());
    const {appLangs} = getConfigData();

    return compact_([
        makePage('general', i18n('title_general'), generalIcon, [
            makeItem('startPage', i18n('field_start-page'), 'top', <StartPageSettingMemo />),
            makeItem(
                'global::newDashboardPage',
                i18n('field_new-dashboard-page'),
                'top',
                <CheckboxSettingItem
                    settingKey={'global::newDashboardPage'}
                    description={i18n('context_new-dashboard-page-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.GLOBAL.AUTO_REFRESH,
                i18n('field_auto-refresh'),
                'top',
                <CheckboxSettingItem
                    settingKey="global::autoRefresh"
                    description={i18n('context_auto-refresh-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.MENU.RECENT_CLUSTER_FIRST,
                i18n('field_recent-clusters'),
                'top',
                <CheckboxSettingItem
                    settingKey="global::menu::recentClustersFirst"
                    description={i18n('context_recent-clusters-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.MENU.RECENT_PAGE_FIRST,
                i18n('field_recent-pages'),
                'top',
                <CheckboxSettingItem
                    settingKey="global::menu::recentPagesFirst"
                    description={i18n('context_recent-pages-description')}
                    oneLine
                />,
            ),
        ]),
        makePage('appearance', i18n('title_appearance'), paletteIcon, [
            ...(appLangs
                ? [
                      makeItem(
                          'global::lang',
                          i18n('field_language'),
                          'top',
                          <SegmentedRadioGroupSettingItem
                              settingKey="global::lang"
                              options={appLangs}
                          />,
                      ),
                  ]
                : []),
            makeItem(
                SettingName.GLOBAL.THEME,
                i18n('field_theme'),
                'top',
                <SegmentedRadioGroupSettingItem
                    settingKey="global::theme"
                    options={[
                        legacyRadioOption('light', i18n('value_theme-light')),
                        legacyRadioOption('dark', i18n('value_theme-dark')),
                        legacyRadioOption('system', i18n('value_theme-system')),
                    ]}
                />,
            ),
            makeItem(
                SettingName.A11Y.USE_SAFE_COLORS,
                i18n('field_contrast'),
                'top',
                <SegmentedRadioGroupSettingItem
                    settingKey="global::a11y::useSafeColors"
                    convertValue={(value) => value === 'true'}
                    options={[
                        legacyRadioOption(false, i18n('value_contrast-normal')),
                        legacyRadioOption(true, i18n('value_contrast-high')),
                    ]}
                />,
            ),
            {
                id: 'global::maxContentWidth',
                title: i18n('field_content-width'),
                align: 'top',
                content: (
                    <SegmentedRadioGroupSettingItem
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
                'development',
                i18n('title_development'),
                closeTagIcon,
                compact_([
                    makeItem(
                        SettingName.DEVELOPMENT.REGULAR_USER_UI,
                        i18n('field_regular-user-ui'),
                        'top',
                        <CheckboxSettingItem
                            settingKey="global::development::regularUserUI"
                            title={i18n('field_regular-user-ui')}
                            description={i18n('context_regular-user-ui-description')}
                        />,
                    ),
                    makeItem(
                        'global::development::showAiChat',
                        i18n('field_ai-chat'),
                        'top',
                        <CheckboxSettingItem
                            settingKey="global::development::showAiChat"
                            description={i18n('context_ai-chat-description')}
                            oneLine
                        />,
                    ),
                ]),
            ),

        makePage('data', i18n('title_data'), dataIcon, [
            makeItem(
                SettingName.YSON.FORMAT,
                i18n('field_data-format'),
                'top',
                <SegmentedRadioGroupSettingItem
                    settingKey="global::yson::format"
                    options={[
                        legacyRadioOption('yson', 'YSON'),
                        legacyRadioOption('json', 'JSON'),
                        legacyRadioOption('raw-json', 'Raw JSON'),
                    ]}
                />,
            ),
            makeItem(
                SettingName.YSON.SHOW_DECODED,
                i18n('field_decode-utf8'),
                'top',
                <CheckboxSettingItem
                    oneLine
                    settingKey="global::yson::showDecoded"
                    description={renderHtmlDescription(
                        i18n('context_decode-utf8-description'),
                        i18n('context_decode-utf8-highlight'),
                    )}
                />,
            ),
            makeItem(
                SettingName.YSON.BINARY_AS_HEX,
                i18n('field_binary-as-hex'),
                'top',
                <CheckboxSettingItem
                    settingKey="global::yson::binaryAsHex"
                    description={i18n('context_binary-as-hex-description')}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.YSON.ESCAPE_WHITESPACES,
                i18n('field_escape-and-highlight'),
                'top',
                <CheckboxSettingItem
                    settingKey="global::yson::escapeWhitespace"
                    description={renderHtmlDescription(
                        i18n('context_escape-whitespaces-description', {
                            n: wrapEscapeText('\\n'),
                            t: wrapEscapeText('\\t'),
                        }),
                        i18n('context_escape-whitespaces-highlight'),
                    )}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.YSON.COMPACT,
                i18n('field_compact-view'),
                'top',
                <CheckboxSettingItem
                    settingKey="global::yson::compact"
                    description={i18n('context_compact-view-description')}
                    oneLine
                />,
            ),
        ]),
        makePage('system', i18n('title_system'), systemIcon, [
            makeItem(
                SettingName.SYSTEM.MASTERS_HOST_TYPE,
                i18n('field_host-type'),
                'top',
                <SegmentedRadioGroupSettingItem
                    description={i18n('context_host-type-description')}
                    settingKey="global::system::mastersHostType"
                    options={mastersRadioButtonItems.map(({value, text}) =>
                        legacyRadioOption(value as 'host' | 'physicalHost', text),
                    )}
                />,
            ),
        ]),
        makePage('operation', i18n('title_operation'), operationsIcon, [
            makeItem(
                SettingName.OPERATIONS.STATISTICS_AGGREGATION_TYPE,
                i18n('field_statistics-type'),
                'top',
                <SegmentedRadioGroupSettingItem
                    description={i18n('context_statistics-type-description')}
                    settingKey="global::operations::statisticsAggregationType"
                    options={AGGREGATOR_RADIO_ITEMS.map(({value, text}) =>
                        legacyRadioOption(value as 'avg' | 'min' | 'max' | 'sum' | 'count', text),
                    )}
                />,
            ),
        ]),
        makePage(
            'navigation',
            i18n('title_navigation'),
            navigationIcon,
            compact_([
                clusterNS &&
                    makeItem(
                        SettingName.LOCAL.NAVIGATION_DEFAULT_PATH,
                        i18n('field_default-path'),
                        'top',
                        <TextInputSettingItem
                            placeholder={i18n('context_default-path-placeholder')}
                            description={i18n('context_default-path-description')}
                            validator={navigationPathValidator}
                            settingKey={`local::${cluster}::navigationDefaultPath`}
                        />,
                    ),
                makeItem(
                    SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS,
                    i18n('field_default-chyt-alias'),
                    'top',
                    <TextInputSettingItem
                        placeholder={i18n('context_default-chyt-alias-placeholder')}
                        description={i18n('context_default-chyt-alias-description')}
                        validator={chytAliasValidator}
                        settingKey="global::navigation::defaultChytAlias"
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.USE_SMART_SORT,
                    i18n('field_smart-sort'),
                    'top',
                    <CheckboxSettingItem
                        settingKey="global::navigation::useSmartSort"
                        description={i18n('context_smart-sort-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.GROUP_NODES,
                    i18n('field_group-nodes'),
                    'top',
                    <CheckboxSettingItem
                        settingKey="global::navigation::groupNodes"
                        description={i18n('context_group-nodes-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.USE_SMART_FILTER,
                    i18n('field_smart-filter'),
                    'top',
                    <CheckboxSettingItem
                        settingKey="global::navigation::useSmartFilter"
                        description={i18n('context_smart-filter-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION,
                    i18n('field_path-autocorrection'),
                    'top',
                    <CheckboxSettingItem
                        settingKey="global::navigation::enablePathAutocorrection"
                        description={renderHtmlDescription(
                            i18n('context_path-autocorrection-description') +
                                ' ' +
                                docsUrl(
                                    'For details see ' +
                                        `<a class="link link_theme_normal" href="${UIFactory.docsUrls['faq:enablepathautocorrection']}" target="_blank">FAQ</a>` +
                                        '.',
                                ),
                        )}
                        oneLine
                    />,
                ),
            ]),
        ),
        makePageBySections('components', i18n('title_components'), componentsIcon, [
            {
                id: 'components/general',
                title: i18n('title_general'),
                items: [
                    makeItem(
                        SettingName.COMPONENTS.ENABLE_SIDE_BAR,
                        i18n('field_enable-side-bar'),
                        'top',
                        <CheckboxSettingItem
                            settingKey="global::components::enableSideBar"
                            description={i18n('context_enable-side-bar-description')}
                            oneLine
                        />,
                    ),
                ],
            },
            {
                id: 'components/memory-popup',
                title: i18n('title_memory-popup'),
                items: [
                    makeItem(
                        'global::components::memoryPopupShowAll',
                        i18n('field_show-empty-categories'),
                        'top',
                        <CheckboxSettingItem
                            settingKey="global::components::memoryPopupShowAll"
                            description={i18n('context_show-empty-categories-description')}
                            oneLine
                        />,
                    ),
                ],
            },
        ]),

        makePage(
            'table',
            i18n('title_table'),
            tableIcon,
            compact_([
                makeItem(
                    'global::development::yqlTypes',
                    i18n('field_yql-v3-types'),
                    'top',
                    <CheckboxSettingItem settingKey="global::development::yqlTypes" oneLine />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ROWS_PER_TABLE_PAGE,
                    i18n('field_rows-per-page'),
                    'top',
                    <SegmentedRadioGroupSettingItem
                        description={i18n('context_rows-per-page-description')}
                        settingKey="global::navigation::rowsPerTablePage"
                        convertValue={Number}
                        options={[
                            legacyRadioOption(10, '10'),
                            legacyRadioOption(50, '50'),
                            legacyRadioOption(100, '100'),
                            legacyRadioOption(200, '200'),
                        ]}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.MAXIMUM_TABLE_STRING_SIZE,
                    i18n('field_cell-size-limit'),
                    'top',
                    <SegmentedRadioGroupSettingItem
                        description={i18n('context_cell-size-limit-description')}
                        settingKey="global::navigation::maximumTableStringSize"
                        convertValue={Number}
                        options={cellSizeRadioButtonItems.map(({value, text}) =>
                            legacyRadioOption(Number(value) as 1024 | 16384 | 32768 | 65536, text),
                        )}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT,
                    i18n('field_default-column-limit'),
                    'top',
                    <SegmentedRadioGroupSettingItem
                        description={i18n('context_default-column-limit-description')}
                        settingKey="global::navigation::defaultTableColumnLimit"
                        convertValue={Number}
                        options={pageSizeRadioButtonItems.map(({value, text}) =>
                            legacyRadioOption(Number(value) as 10 | 50 | 100 | 200, text),
                        )}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY,
                    i18n('field_guess-visible-columns'),
                    'top',
                    <CheckboxSettingItem
                        settingKey="global::navigation::enableTableSimilarity"
                        description={i18n('context_guess-visible-columns-description')}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS,
                    i18n('field_raw-strings'),
                    'top',
                    <CheckboxSettingItem
                        description={i18n('context_raw-strings-description')}
                        settingKey="global::navigation::tableDisplayRawStrings"
                        oneLine
                    />,
                ),
            ]),
        ),

        oauthTokenUrl &&
            makePage('auth', i18n('title_auth'), shieldIcon, [
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
                'vcs',
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

        makePageBySections('editor', i18n('title_editor'), PencilToSquareIcon, [
            {
                id: 'visual-settings',
                title: i18n('title_visual-settings'),
                items: [
                    makeItem(
                        'global::editor::vimMode',
                        i18n('field_vim-mode'),
                        'top',
                        <CheckboxSettingItem
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
            'about',
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

export function useSettingsDescription(): Array<SettingsPage> {
    const isAdmin = useSelector(selectIsDeveloperOrWatchmen);
    const cluster = useClusterFromLocation();
    const login = useSelector(selectCurrentUserName);

    const settings = useSettings(cluster, isAdmin);
    const externalSettings = UIFactory.getExternalSettings({cluster, isAdmin, login});

    const res = React.useMemo(() => {
        const extPages: Record<string, SettingsPage> = mapById(externalSettings);
        return produce(settings, (pages) => {
            forEach_(pages, (page) => {
                const extPage = extPages[page.id];
                if (extPage) {
                    delete extPages[page.id];
                    const extSections = mapById(extPage.sections);
                    forEach_(page.sections, (section) => {
                        const s = extSections[section.id];
                        if (s) {
                            delete extSections[section.id];
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

function mapById<T extends {id: string}>(data: Array<T>) {
    return reduce_(
        data,
        (acc, item) => {
            acc[item.id] = item;
            return acc;
        },
        {} as Record<string, T>,
    );
}

function StartPageSetting() {
    const {all} = useSelector(selectRecentPagesInfo);

    const pageItems = React.useMemo(() => {
        const pagesById = mapById(all);
        return compact_(
            STARTING_PAGE_IDS.map((pageId) => {
                const page = pagesById[pageId];
                return page?.header ? legacyRadioOption(pageId, page.name) : undefined;
            }),
        );
    }, [all]);

    return (
        <SegmentedRadioGroupSettingItem
            settingKey="global::menu::startingPage"
            options={pageItems}
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
