import React from 'react';
import {useSelector} from 'react-redux';
import {Flex, IconProps, Text} from '@gravity-ui/uikit';

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
    getCurrentUserName,
    getGlobalMasterVersion,
    getGlobalSchedulerVersion,
    getHttpProxyVersion,
} from '../../store/selectors/global';
import {isDeveloperOrWatchMen} from '../../store/selectors/global/is-developer';
import {
    cellSizeRadioButtonItems,
    pageSizeRadioButtonItems,
} from '../../constants/navigation/content/table';
import {YT} from '../../config/yt-config';
import Link from '../../components/Link/Link';
import Button from '../../components/Button/Button';
import {AddTokenForm, VcsList} from '../../pages/query-tracker/Vcs/SettingsMenu';
import {selectIsVcsVisible, selectVcsConfig} from '../../pages/query-tracker/module/vcs/selectors';
import {SettingsMenuRadioByKey, SettingsMenuSelect} from '../SettingsMenu/SettingsMenuSelect';
import {getDefaultQueryACO} from '../../pages/query-tracker/module/query_aco/selectors';
import {getQueryACO, setUserDefaultACO} from '../../pages/query-tracker/module/query_aco/actions';
import {Item} from '../../components/Select/Select';
import {useThunkDispatch} from '../../store/thunkDispatch';
import {BooleanSettingItem} from '../SettingsMenu/BooleanSettingItem';

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
    const dispatch = useThunkDispatch();
    const clusterNS = useSelector(getCurrentClusterNS);

    const httpProxyVersion = useSelector(getHttpProxyVersion);
    const schedulerVersion = useSelector(getGlobalSchedulerVersion);
    const masterVersion = useSelector(getGlobalMasterVersion);
    const vcsConfig = useSelector(selectVcsConfig);
    const isVcsVisible = useSelector(selectIsVcsVisible);
    const defaultUserACO = useSelector(getDefaultQueryACO);
    const hasQuerySuggestions = Boolean(UIFactory.getInlineSuggestionsApi());

    return compact_([
        makePage('General', generalIcon, [
            makeItem('startPage', 'Start page', 'top', <StartPageSettingMemo />),
            makeItem(
                SettingName.GLOBAL.AUTO_REFRESH,
                'Use auto refresh',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.GLOBAL.AUTO_REFRESH}
                    settingNS={NAMESPACES.GLOBAL}
                    annotation="Automatically update pages with highly dynamic content"
                    oneLine={true}
                />,
            ),
            makeItem(
                SettingName.MENU.RECENT_CLUSTER_FIRST,
                'Use recent clusters',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.MENU.RECENT_CLUSTER_FIRST}
                    settingNS={NAMESPACES.MENU}
                    annotation={'Recently visited clusters appear at the top of cluster menu.'}
                    oneLine
                />,
            ),
            makeItem(
                SettingName.MENU.RECENT_PAGE_FIRST,
                'Use recent pages',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.MENU.RECENT_PAGE_FIRST}
                    settingNS={NAMESPACES.MENU}
                    annotation={'Recently visited pages appear at the top of pages menu.'}
                    oneLine
                />,
            ),
        ]),
        makePage('Appearance', paletteIcon, [
            makeItem(
                SettingName.GLOBAL.THEME,
                'Theme',
                'top',
                <SettingsMenuRadio
                    settingName={SettingName.GLOBAL.THEME}
                    settingNS={NAMESPACES.GLOBAL}
                    items={[
                        {value: 'light', text: 'Light'},
                        {value: 'dark', text: 'Dark'},
                        {value: 'system', text: 'System'},
                    ]}
                />,
            ),
            makeItem(
                SettingName.A11Y.USE_SAFE_COLORS,
                'Contrast',
                'top',
                <SettingsMenuRadio
                    settingName={SettingName.A11Y.USE_SAFE_COLORS}
                    settingNS={NAMESPACES.A11Y}
                    convertValue={(value) => value === 'true'}
                    items={[
                        {value: 'false', text: 'Normal'},
                        {value: 'true', text: 'High'},
                    ]}
                />,
            ),
            {
                id: 'global::maxContentWidth',
                title: 'Content width',
                align: 'top',
                content: (
                    <SettingsMenuRadioByKey
                        settingKey="global::maxContentWidth"
                        options={[
                            {value: 'standard', content: 'Standard'},
                            {value: 'wide', content: 'Wide'},
                            {value: 'maximum', content: 'Maximum'},
                        ]}
                    />
                ),
            },
        ]),
        makePage(
            'Development',
            closeTagIcon,
            compact_([
                isAdmin &&
                    makeItem(
                        SettingName.DEVELOPMENT.REGULAR_USER_UI,
                        "Show regular user's UI",
                        'top',
                        <SettingsMenuItem
                            settingName={SettingName.DEVELOPMENT.REGULAR_USER_UI}
                            settingNS={NAMESPACES.DEVELOPMENT}
                            label={"Show regular user's UI"}
                            annotation={
                                'There is some difference in UI for development-team and regular users, ' +
                                'enabling of the option allows to see exactly the same what see a regular user.'
                            }
                        />,
                    ),
                makeItem(
                    SettingName.QUERY_TRACKER.STAGE,
                    'Query Tracker Stage',
                    'top',
                    <SettingsMenuInput
                        placeholder="Enter stage..."
                        description="Default Query Tracker stage is 'production'. But you can reassign it with this setting."
                        settingName={SettingName.QUERY_TRACKER.STAGE}
                        settingNS={NAMESPACES.QUERY_TRACKER}
                    />,
                ),
                makeItem(
                    SettingName.QUERY_TRACKER.YQL_AGENT_STAGE,
                    'YQL agent stage',
                    'top',
                    <SettingsMenuInput
                        placeholder="Enter YQL agent stage..."
                        settingName={SettingName.QUERY_TRACKER.YQL_AGENT_STAGE}
                        settingNS={NAMESPACES.QUERY_TRACKER}
                    />,
                ),
            ]),
        ),

        makePage('Data', dataIcon, [
            makeItem(
                SettingName.YSON.FORMAT,
                'Data format',
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
                'Decode data as UTF8',
                'top',
                <SettingsMenuItem
                    oneLine={true}
                    settingName={SettingName.YSON.SHOW_DECODED}
                    settingNS={NAMESPACES.YSON}
                    annotation={
                        'Attempt to decode UTF-8 strings. Show Unicode symbols upon success and mark ' +
                        'data as binary otherwise.'
                    }
                    annotationHighlight={
                        'Please note that YSON does not natively support Unicode symbols ' +
                        '&mdash; therefore you would not be able to copy-paste presented YSON as is.'
                    }
                />,
            ),
            makeItem(
                SettingName.YSON.BINARY_AS_HEX,
                'Binary as HEX',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.YSON.BINARY_AS_HEX}
                    settingNS={NAMESPACES.YSON}
                    annotation={
                        'Display binary strings as HEX sequences. Strings that were not decoded as UTF8 are therefore considered binary and ' +
                        'displayed as HEX sequences.'
                    }
                    oneLine
                />,
            ),
            makeItem(
                SettingName.YSON.ESCAPE_WHITESPACES,
                'Escape and highlight',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.YSON.ESCAPE_WHITESPACES}
                    settingNS={NAMESPACES.YSON}
                    annotation={
                        `Symbols ${wrapEscapeText('\\n')} and ${wrapEscapeText(
                            '\\t',
                        )} will be rendered as escape sequences, whitespaces will be ` +
                        'highlighted as neccessary. Does not affect Raw JSON format.'
                    }
                    annotationHighlight={
                        'Please note that JSON does not support unescaped control characters ' +
                        '&mdash; therefore you would not be able to copy-paste presented JSON as is.'
                    }
                    oneLine
                />,
            ),
            makeItem(
                SettingName.YSON.COMPACT,
                'Compact view',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.YSON.COMPACT}
                    settingNS={NAMESPACES.YSON}
                    annotation={
                        'Single element lists are rendered inline, so are maps with one property. Does ' +
                        'not affect Raw JSON format.'
                    }
                    oneLine
                />,
            ),
        ]),
        makePage('System', systemIcon, [
            makeItem(
                SettingName.SYSTEM.MASTERS_HOST_TYPE,
                'Host type of Masters/Schedulers/Controller',
                'top',
                <SettingsMenuRadio
                    description="Select the default view of host to display on in the Masters/Schedulers and Controller agents section."
                    settingName={SettingName.SYSTEM.MASTERS_HOST_TYPE}
                    settingNS={NAMESPACES.SYSTEM}
                    items={mastersRadioButtonItems}
                />,
            ),
        ]),
        makePage('Operation', operationsIcon, [
            makeItem(
                SettingName.OPERATIONS.STATISTICS_AGGREGATION_TYPE,
                "Statistic's type",
                'top',
                <SettingsMenuRadio
                    description="Select the default type of job aggregation."
                    settingName={SettingName.OPERATIONS.STATISTICS_AGGREGATION_TYPE}
                    settingNS={NAMESPACES.OPERATIONS}
                    items={AGGREGATOR_RADIO_ITEMS}
                />,
            ),
        ]),
        makePage(
            'Navigation',
            navigationIcon,
            compact_([
                clusterNS &&
                    makeItem(
                        SettingName.LOCAL.NAVIGATION_DEFAULT_PATH,
                        'Default path',
                        'top',
                        <SettingsMenuInput
                            placeholder="Enter default navigation path..."
                            description="Cluster specific path that will be opened by default in the the Navigation page."
                            validator={navigationPathValidator}
                            settingName={SettingName.LOCAL.NAVIGATION_DEFAULT_PATH}
                            settingNS={clusterNS}
                        />,
                    ),
                makeItem(
                    SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS,
                    'Default chyt alias',
                    'top',
                    <SettingsMenuInput
                        placeholder="Enter default chyt alias..."
                        description="User alias for the YQL Kit default query string in ClickHouse mode."
                        validator={chytAliasValidator}
                        settingName={SettingName.NAVIGATION.DEFAULT_CHYT_ALIAS}
                        settingNS={NAMESPACES.NAVIGATION}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.USE_SMART_SORT,
                    'Use smart sort',
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.USE_SMART_SORT}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={
                            'Nodes with names that represent dates will be sorted from newest date to ' +
                            'oldest, while other nodes will be sorted alphabetically.'
                        }
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.GROUP_NODES,
                    'Group nodes by type',
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.GROUP_NODES}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={
                            'Nodes will be grouped by type and each type will be sorted independently, ' +
                            'folders first, then tables, then files.'
                        }
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.USE_SMART_FILTER,
                    'Use smart filter',
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.USE_SMART_FILTER}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={'Use logical operators in filter like "and" and "or"'}
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION,
                    'Path autocorrection',
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.ENABLE_PATH_AUTO_CORRECTION}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={
                            'Autocorrect erroneous path if possible. ' +
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
        makePageBySections('Components', componentsIcon, [
            {
                title: 'General',
                items: [
                    makeItem(
                        SettingName.COMPONENTS.ENABLE_SIDE_BAR,
                        'Enable side bar',
                        'top',
                        <SettingsMenuItem
                            settingName={SettingName.COMPONENTS.ENABLE_SIDE_BAR}
                            settingNS={NAMESPACES.COMPONENTS}
                            annotation="Display node data in the side bar when clicked."
                            oneLine={true}
                        />,
                    ),
                ],
            },
            {
                title: 'Memory popup',
                items: [
                    makeItem(
                        'global::components::memoryPopupShowAll',
                        'Show empty categories',
                        'top',
                        <BooleanSettingItem
                            settingKey="global::components::memoryPopupShowAll"
                            description="Display all memory categories even with 0B"
                            oneLine
                        />,
                    ),
                ],
            },
        ]),

        makePage(
            'Table',
            tableIcon,
            compact_([
                makeItem(
                    SettingName.DEVELOPMENT.YQL_TYPES,
                    'YQL V3 types',
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
                    'Rows per page',
                    'top',
                    <SettingsMenuRadio
                        description="Select the default number of rows to display on one table page.
                        The number can be changed for the specific table using table settings button."
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
                    'Cell size limit',
                    'top',
                    <SettingsMenuRadio
                        description="Select the default cell size limit for tables.
                        The cell size limit for the specific table can be changed using table settings button."
                        settingName={SettingName.NAVIGATION.MAXIMUM_TABLE_STRING_SIZE}
                        settingNS={NAMESPACES.NAVIGATION}
                        items={cellSizeRadioButtonItems}
                        convertValue={Number}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT,
                    'Default column limit',
                    'top',
                    <SettingsMenuRadio
                        description="Select the default column limit for tables. In other words, how many columns will be shown
                        when no column has even been hidden using ColumnSelector for the particular table or (if table
                        similarity is enabled) for the similar table."
                        settingName={SettingName.NAVIGATION.DEFAULT_TABLE_COLUMN_LIMIT}
                        settingNS={NAMESPACES.NAVIGATION}
                        items={pageSizeRadioButtonItems}
                        convertValue={Number}
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY,
                    'Guess visible columns',
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.NAVIGATION.ENABLE_TABLE_SIMILARITY}
                        settingNS={NAMESPACES.NAVIGATION}
                        annotation={
                            'Use table similarity for guessing visible columns. ' +
                            'Show same visible columns in table A as in table B if these tables are similar ' +
                            'and those columns have been previously set as visible for table B.'
                        }
                        oneLine
                    />,
                ),
                makeItem(
                    SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS,
                    'Allow raw string-values',
                    'top',
                    <SettingsMenuItem
                        annotation="Cells with string values will be displayed without escaping."
                        settingName={SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS}
                        settingNS={NAMESPACES.NAVIGATION}
                        oneLine
                    />,
                ),
            ]),
        ),

        oauthTokenUrl &&
            makePage('Auth', shieldIcon, [
                makeItem(
                    'oauthToken',
                    'YT OAuth token',
                    undefined,
                    <Link url={oauthTokenUrl} target="_blank">
                        <Button size={'s'}>Show my token</Button>
                    </Link>,
                ),
            ]),

        isVcsVisible &&
            makePage(
                'VCS',
                LogoGitlabIcon,
                compact_([
                    makeItem('addTokenForm', 'Add or replace token', undefined, <AddTokenForm />),
                    Boolean(vcsConfig.some((i) => i.hasToken)) &&
                        makeItem(
                            'existingTokenList',
                            'Existing tokens',
                            undefined,
                            <VcsList config={vcsConfig} />,
                        ),
                ]),
            ),

        makePageBySections('Editor', PencilToSquareIcon, [
            {
                title: 'Visual settings',
                items: [
                    makeItem(
                        'global::editor::vimMode',
                        'Vim mode',
                        'top',
                        <BooleanSettingItem
                            settingKey="global::editor::vimMode"
                            description="Use monaco vim mode"
                            oneLine
                        />,
                    ),
                ],
            },
        ]),
        makePage(
            'Queries',
            undefined,
            compact_([
                cluster &&
                    makeItem(
                        'defaultACO',
                        'Default ACO',
                        undefined,
                        <SettingsMenuSelect
                            getOptionsOnMount={() =>
                                dispatch(getQueryACO()).then((data) => {
                                    return data.access_control_objects.reduce(
                                        (acc: Item[], item: string) => {
                                            acc.push({value: item, text: item});
                                            return acc;
                                        },
                                        [] as Item[],
                                    );
                                })
                            }
                            setSetting={(value) => value && dispatch(setUserDefaultACO(value))}
                            getSetting={() => defaultUserACO}
                        />,
                    ),
                makeItem(
                    'global::queryTracker::useNewGraphView',
                    'Use new graph progress',
                    'top',
                    <BooleanSettingItem
                        settingKey="global::queryTracker::useNewGraphView"
                        description="Enable experimental graph vew for Progress tab of a query"
                        oneLine
                    />,
                ),
                ...(hasQuerySuggestions
                    ? [
                          makeItem(
                              'global::queryTracker::suggestions',
                              'Query assistant',
                              'top',
                              <BooleanSettingItem
                                  settingKey="global::queryTracker::suggestions"
                                  description={
                                      <Flex direction="column">
                                          <div>Use query assistant to autocomplete</div>
                                          <Text color="secondary">[Tab] - accept suggestion</Text>
                                          <Text color="secondary">[Esc] - decline suggestion</Text>
                                      </Flex>
                                  }
                                  oneLine
                              />,
                          ),
                      ]
                    : []),
            ]),
        ),

        makePage(
            'About',
            infoIcon,
            compact_([
                Boolean(cluster) &&
                    makeItem('httpProxyVersion', 'HTTP proxy version', undefined, httpProxyVersion),
                Boolean(cluster) &&
                    makeItem('schedulerVersion', 'Scheduler version', undefined, schedulerVersion),
                Boolean(cluster) &&
                    makeItem('masterVersion', 'Master version', undefined, masterVersion),
                makeItem(
                    'interfaceVersion',
                    'Interface version',
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
    const isAdmin = useSelector(isDeveloperOrWatchMen) || true;
    const cluster = useClusterFromLocation();
    const login = useSelector(getCurrentUserName);

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
