import type {Request} from 'express';
import {YTCoreConfig} from '../../@types/core';
import {ConfigData, YTConfig} from '../../shared/yt-types';
import {AppLayoutConfig} from '../render-layout';
import {isUserColumnPresetsEnabled} from '../controllers/table-column-preset';
import {getInterfaceVersion, isProductionEnv} from '../utils';
import {getAuthWay} from '../utils/authorization';
import {getOAuthSettings, isOAuthAllowed} from './oauth';

interface Params {
    login?: string;
    uid?: string;
    cluster: string | undefined;
    settings: ConfigData['settings'];
    ytConfig: Partial<YTConfig>;
}

export async function getLayoutConfig(req: Request, params: Params): Promise<AppLayoutConfig> {
    const {login, ytConfig, settings} = params;
    const {ytApiUseCORS, uiSettings, metrikaCounter, ytAuthCluster, odinBaseUrl} = req.ctx
        .config as YTCoreConfig;
    const YT = ytConfig;
    const uiVersion = getInterfaceVersion();

    const parameters = {
        interface: {
            version: uiVersion,
        },
        login,
        authWay: getAuthWay(req),
    };

    const isProduction = isProductionEnv();

    const res: AppLayoutConfig = {
        bodyContent: {root: ''},
        title: 'YT',
        lang: 'en',
        meta: [
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0',
            },
        ],
        inlineScripts: [
            `window.YT = Object.assign(window.YT || {}, ${JSON.stringify(YT)}, ${JSON.stringify({
                parameters,
            })});`,
            `window.YT.environment = window.YT.environment || (${isProduction} ? 'production' : 'development');`,
            `window.DL = {"deviceType":"desktop","requestId":"2705a80dfb186998cb204b6a826ccdba","env":"development","installationType":"nemax","serviceName":"DataLens","user":{"login":"yeee737@nebius.com","id":"ee8jsmrbc5el3njb9c9e","federationName":"sys-federation-sandbox-nebius-azure-ad","federationId":"sys.federation.sandbox-nebius-azure-ad","avatar":"https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-middle","avatarData":"","isFederationUser":true,"displayName":"yeee737@nebius.com","isGlobalFederationUser":false,"isLocalFederationUser":true,"formattedLogin":"yeee737@nebius.com","email":"yeee737@nebius.com","lang":"en"},"userSettings":{"phone":"+31616157624","email":"yeee737@nebius.com","cloudId":"bjefia1ibkicnbn4s0ib","folderId":"bje0qjiaqssiv6tnffo5","orgId":"yc.organization-manager.sandbox","tld":"ai","isCompact":false,"promoTooltipShowed":{"billing_history-tooltip":true},"language":"en"},"iamUserId":"ee8jsmrbc5el3njb9c9e","currentTenantId":"org_yc.organization-manager.sandbox","clouds":[],"endpoints":{"gateway":"/gateway","charts":"","connections":"/connections","dataset":"/datasets","wizard":"/wizard","ql":"/ql","dash":"/dashboards","navigation":"/navigation","widgets":"/widgets","marketplace":"/marketplace","preview":"/preview","serviceSettings":"/settings","extPassportOAuth":"https://auth.nebius.ai","intPassportOAuth":"https://as.private-api.nemax.nebiuscloud.net","datalensDocs":"https://nebius.com/il/docs/datalens","uploaderV2":"https://upload.back.datalens.il.nebius.com","uploaderComV2":"https://upload.back.datalens.il.nebius.com","docs":"https://nebius.com/il/docs","support":"https://console.nebius.ai/support","console":"https://console.nebius.ai","monitoring":"https://monitoring.private-api.nemax.nebiuscloud.net","privacyPolicy":"https://nebius.com/il/docs/legal/privacy","termsOfUse":"https://nebius.com/il/docs/legal/terms","cloud":"https://nebius.com/il","supportEmail":"support@nebius.ai","avatarHost":"https://avatars.mds.yandex.net","illustrationStorage":"https://storage.nemax.nebius.cloud/common/illustrations-v2","jira":"https://nebius.atlassian.net"},"features":{"AddDemoWorkbook":false,"AsideHeaderEnabled":true,"AuthUpdateWithTimeout":false,"ChartEditorDeveloperModeCheck":false,"chartkitAlerts":false,"CloudMode":true,"CollectionsAccessEnabled":true,"CollectionsEnabled":true,"CustomColorPalettes":true,"DashAutorefresh":true,"DashBoardAccessDescription":false,"DashBoardSupportDescription":false,"DashBoardWidgetParamsStrictValidation":true,"DatasetsRLS":true,"emptySelector":false,"EnableChartEditor":false,"EnableCustomMonitoring":false,"EnableDashChartStat":false,"EnableMobileHeader":false,"EnablePublishEntry":false,"EntryMenuEditor":false,"EntryMenuItemAccess":false,"EntryMenuItemCopy":false,"EntryMenuItemMove":false,"EntryMenuItemSecureEmbedding":false,"EscapeUserHtmlInDefaultHcTooltip":true,"ExtendedDateManulaControl":true,"ExternalSelectors":false,"FetchDocumentation":false,"FieldEditorDocSection":true,"GSheetsV2Enabled":false,"GenericDatetime":false,"GenericDatetimeMigration":false,"GrpcRecreateService":true,"HelpCenterEnabled":false,"HolidaysOnChart":true,"MenuItemsFlatView":true,"MirroredEntries":true,"MultipleColorsInVisualization":true,"D3PieVisualization":false,"PivotTableSortWithTotals":false,"QLMonitoring":true,"QLPrometheus":true,"ql":true,"QlAutoExecuteMonitoringChart":true,"ReadOnlyMode":false,"RevisionsListNoLimit":false,"D3ScatterVisualization":false,"SecureEmbeddingEnabled":false,"ShouldCheckEditorAccess":false,"ShowChartsEngineDebugInfo":true,"ShowCreateEntryWithMenu":false,"ShowFilteringChartSetting":false,"ShowInspectorDetails":false,"showNewRelations":false,"ShowPromoIntro":true,"StatusIllustrations":true,"suggestEnabled":false,"SupportReportEnabled":true,"UseChartsEngineLogin":false,"UseChartsEngineResponseConfig":false,"UseComponentHeader":false,"UseConfigurableChartkit":false,"UseNavigation":false,"UsePublicDistincts":false,"UseYqlFolderKey":false,"WysiwygEditorImageItem":true,"XlsxChartExportEnabled":true,"XlsxFilesEnabled":true,"YandexGpt":false},"dynamicFeatures":{"yandexMapOpensource":true,"PivotTablePagination":true,"PivotTableBackgroundSettings":true},"meta":{"x-request-id":"2705a80dfb186998cb204b6a826ccdba"},"organizationId":"","projectId":"","organizations":[{"labels":{},"id":"yc.organization-manager.sandbox","createdAt":{"seconds":"1688640915","nanos":217095000},"name":"yc-organization-manager-sandbox","description":"Nebius Cloud sandbox organization","status":"ACTIVE","title":"Nebius Cloud sandbox","dlActivated":true}],"allowLanguages":["en"],"langRegion":"ai","envSettings":{"auth":{"isYandexLoginEnabled":false,"isGoogleLoginEnabled":true,"isGithubLoginEnabled":true},"backoffice":{"enableBlogServices":true},"common":{"techPreviewFlowEnabled":false,"asideImgUrls":{"light":"https://storage.nemax.nebius.cloud/common/console/img/aside-light.jpg","dark":"https://storage.nemax.nebius.cloud/common/console/img/aside-dark.jpg"},"communicationsCheckEnabled":false,"hiringPromoEnabled":false,"iamAddYandexUsersEnabled":false,"alphaAccessEnabled":true,"userSettings":["subscriptions.mail","subscriptions.tech","subscriptions.security","subscriptions.alerting","subscriptions.billing","subscriptions.info","subscriptions.feature","subscriptions.event","subscriptions.promo","subscriptions.testing","appearance.theme","region.language","region.timezone","region.dateformat","region.dateseparator","region.timeformat"],"navigationHeaderDecoration":false,"billing":{"paymentWhitelist":[]},"addUsersToOrgActionsEnabled":["invite-users","add-federation-users"],"newYearMoodAllowed":false},"console":{"promoBannersDisabled":false,"navigationPawStatusDisabled":true}},"iamResources":{"collection":{"roles":{"admin":"datalens.collections.admin","editor":"datalens.collections.editor","viewer":"datalens.collections.viewer","limitedViewer":"datalens.collections.limitedViewer"}},"workbook":{"roles":{"admin":"datalens.workbooks.admin","editor":"datalens.workbooks.editor","viewer":"datalens.workbooks.viewer","limitedViewer":"datalens.workbooks.limitedViewer"}}},"chartkitSettings":{"highcharts":{"enabled":true},"yandexMap":{"enabled":false}},"navigationSourceUrl":"https://storage.nemax.nebius.cloud/ui-api-gpu-services-static/services-external-en.json","tenantMode":{"foldersEnabled":false,"workbooksEnabled":true,"collectionsEnabled":true},"userIsOrgAdmin":true,"templateWorkbookId":"yci4cmkooa5ap","learningMaterialsWorkbookId":"zl3k624fblb8q","docPathName":{"datasetSubsql":"/concepts/dataset/settings#sql-request-in-datatset","qlCreateChart":"/operations/chart/create-sql-chart"},"extraPalettes":{"default-palette":{"id":"default-palette","scheme":["#4DA2F1","#FF3D64","#8AD554","#FFC636","#FFB9DD","#84D1EE","#FF91A1","#54A520","#DB9100","#BA74B3","#1F68A9","#ED65A9","#0FA08D","#FF7E00","#E8B0A4","#52A6C5","#BE2443","#70C1AF","#FFB46C","#DCA3D7"],"datalens":true},"emerald20-palette":{"id":"emerald20-palette","scheme":["#C2EEBA","#AEEAAA","#99E69A","#89E192","#79DD8B","#68D986","#58D583","#48D183","#37CD84","#30C086","#2EB887","#2CAF88","#2AA788","#289F87","#269786","#248F84","#228782","#207E7E","#1E7276","#1C666E"],"gradient":true},"neutral20-palette":{"id":"neutral20-palette","scheme":["#EAEAEA","#E3E3E3","#DBDBDB","#D3D3D3","#CCCCCC","#C4C4C4","#BCBCBC","#B5B5B5","#ADADAD","#A6A6A6","#9E9E9E","#969696","#8F8F8F","#878787","#7F7F7F","#787878","#707070","#686868","#616161","#595959"],"gradient":true},"golden20-palette":{"id":"golden20-palette","scheme":["#FDEC4D","#FDDE43","#FDD039","#FDBF2F","#FDAE25","#FD9B1B","#FD8711","#FD7207","#F75C02","#ED4902","#E33702","#D92602","#CF1702","#C40802","#BA0208","#B00213","#A6021D","#9C0125","#92012D","#880132"],"gradient":true},"oceanic20-palette":{"id":"oceanic20-palette","scheme":["#AEF8FE","#9FF2FE","#90EAFE","#81E1FE","#71D6FE","#62CAFE","#53BCFE","#44ADFE","#359DFD","#258AFD","#1677FD","#0762FD","#024FF3","#023EE4","#0230D5","#0222C5","#0117B6","#010DA7","#010498","#050189"],"gradient":true},"traffic-light9-palette":{"id":"traffic-light9-palette","scheme":["#9C0125","#F17A03","#228782","#C40802","#FDA816","#2EB887","#ED4902","#FDCE34","#79DD8B"],"gradient":true},"datalens-neo-20-palette":{"id":"datalens-neo-20-palette","scheme":["#DB9101","#4DA2F1","#8AD554","#BA74B3","#FF3D64","#FFC636","#0CA18C","#DBA2D7","#BF2543","#84D1EE","#6B6B6B","#EEB184","#1E69A9","#FF7E00","#54A520","#B9B0AC","#58A9C8","#FFB46C","#70C1AF","#FF90A1"],"datalens":true}},"sentryClientOptions":{"autoSessionTracking":false,"dsn":"https://13b3fe564ad5904181c4e3604e66e06b@o4505906584485888.ingest.sentry.io/4506026543284225"},"enableBugreport":true};`
        ],
        data: {
            settings,
            ytApiUseCORS,
            uiSettings,
            metrikaCounterId: metrikaCounter?.[0]?.id,
            allowLoginDialog: Boolean(ytAuthCluster),
            allowOAuth: isOAuthAllowed(req),
            oauthButtonLabel: isOAuthAllowed(req) ? getOAuthSettings(req).buttonLabel : undefined,
            allowUserColumnPresets: isUserColumnPresetsEnabled(req),
            odinPageEnabled: Boolean(odinBaseUrl),
        },
        pluginsOptions: {
            yandexMetrika: {
                counter: metrikaCounter,
            },
            layout: {
                name: 'main',
            },
        },
        scripts: [
            {
                src: 'https://datalens.yeee737-vm.ui.nebius.com/build/i18n/en-ai.38a7c357.js'
            }
        ]
    };
    return res;
}
