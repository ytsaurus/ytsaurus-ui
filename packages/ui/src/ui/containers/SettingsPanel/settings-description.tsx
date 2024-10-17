import React from 'react';
import {useSelector} from 'react-redux';
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
import {useClusterFromLocation} from '../../hooks/use-cluster';
import {docsUrl} from '../../config/index';
import {uiSettings} from '../../config/ui-settings';

import ypath from '../../common/thor/ypath';

import {AGGREGATOR_RADIO_ITEMS} from '../../constants/operations/statistics';
import {NAMESPACES, SettingName} from '../../../shared/constants/settings';
import {getRecentPagesInfo} from '../../store/selectors/slideoutMenu';
import SettingsMenuItem from '../../containers/SettingsMenu/SettingsMenuItem';
import SettingsMenuRadio from '../../containers/SettingsMenu/SettingsMenuRadio';
import SettingsMenuInput from '../SettingsMenu/SettingsMenuInput';
import {
    getCurrentClusterNS,
    getCurrentUserName,
    getGlobalMasterVersion,
    getGlobalSchedulerVersion,
    getHttpProxyVersion,
    isDeveloperOrWatchMen,
} from '../../store/selectors/global';
import {
    cellSizeRadioButtonItems,
    pageSizeRadioButtonItems,
} from '../../constants/navigation/content/table';
import YT from '../../config/yt-config';
import Link from '../../components/Link/Link';
import Button from '../../components/Button/Button';
import {AddTokenForm, VcsList} from '../../pages/query-tracker/Vcs/SettingsMenu';
import {selectIsVcsVisible, selectVcsConfig} from '../../pages/query-tracker/module/vcs/selectors';

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

    const httpProxyVersion: string = useSelector(getHttpProxyVersion);
    const schedulerVersion: string = useSelector(getGlobalSchedulerVersion);
    const masterVersion: string = useSelector(getGlobalMasterVersion);
    const vcsConfig = useSelector(selectVcsConfig);
    const isVcsVisible = useSelector(selectIsVcsVisible);

    return compact_([
        makePage('General', generalIcon, [
            makeItem('Start page', 'top', <StartPageSettingMemo />),
            makeItem(
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
        ]),
        makePage(
            'Development',
            closeTagIcon,
            compact_([
                isAdmin &&
                    makeItem(
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
                    'YQL agent stage',
                    'top',
                    <SettingsMenuInput
                        placeholder="Enter YQL agent stage..."
                        settingName={SettingName.QUERY_TRACKER.YQL_AGENT_STAGE}
                        settingNS={NAMESPACES.QUERY_TRACKER}
                    />,
                ),
                makeItem(
                    'Query tracker graph',
                    'top',
                    <SettingsMenuItem
                        label="New graph type"
                        annotation="Shows the new graph type in the Progress tab for query tracker"
                        settingName={SettingName.QUERY_TRACKER.NEW_GRAPH_TYPE}
                        settingNS={NAMESPACES.QUERY_TRACKER}
                    />,
                ),
            ]),
        ),

        makePage('Data', dataIcon, [
            makeItem(
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
        makePage('Components', componentsIcon, [
            makeItem(
                'Enable side bar',
                'top',
                <SettingsMenuItem
                    settingName={SettingName.COMPONENTS.ENABLE_SIDE_BAR}
                    settingNS={NAMESPACES.COMPONENTS}
                    annotation="Display node data in the side bar when clicked."
                    oneLine={true}
                />,
            ),
        ]),

        makePage(
            'Table',
            tableIcon,
            compact_([
                makeItem(
                    'YQL V3 types',
                    'top',
                    <SettingsMenuItem
                        settingName={SettingName.DEVELOPMENT.YQL_TYPES}
                        settingNS={NAMESPACES.DEVELOPMENT}
                        oneLine
                    />,
                ),
                makeItem(
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
                    makeItem('Add or replace token', undefined, <AddTokenForm />),
                    Boolean(vcsConfig.some((i) => i.hasToken)) &&
                        makeItem('Existing tokens', undefined, <VcsList config={vcsConfig} />),
                ]),
            ),

        makePage(
            'About',
            infoIcon,
            compact_([
                Boolean(cluster) && makeItem('HTTP proxy version', undefined, httpProxyVersion),
                Boolean(cluster) && makeItem('Scheduler version', undefined, schedulerVersion),
                Boolean(cluster) && makeItem('Master version', undefined, masterVersion),
                makeItem('Interface version', undefined, YT.parameters.interface.version),
            ]),
        ),
    ]);
}

export function makePage(
    title: string,
    icon: IconProps | undefined,
    items: Array<SettingsItem>,
): SettingsPage {
    return {title, icon: icon || generalIcon, sections: [{title, items}]};
}

export function makeItem(
    title: string,
    align?: SettingsItem['align'],
    content?: React.ReactNode,
): SettingsItem {
    return {title, align, content};
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
                            section.items.push(...s.items);
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
