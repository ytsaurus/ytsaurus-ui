import type {AIChatConfig} from './ai-chat';

export interface UISettings {
    accessLogBasePath?: string;
    accountsUsageBasePath?: string;
    docsBaseUrl?: string;
    jupyterBasePath?: string;

    newTableReplicasCount: number;

    uploadTableMaxSize: number;
    uploadTableUseLocalmode?: boolean;

    uploadTableExcelBaseUrl?: string;
    exportTableBaseUrl?: string;

    directDownload?: boolean;

    trackerBaseUrl?: string;
    trackerQuoteRequestQueue?: string;
    trackerAdminRequestQueue?: string;

    reportBugUrl?: string;

    datalensBaseUrl?: string;
    datalensAllowedCluster?: Array<string>;

    announcesMailListUrl?: string;

    queryTrackerStage?: string;
    queryTrackerCluster?: string;

    oauthTokenUrl?: string;

    defaultFontType?: keyof Required<UISettings>['fontTypes'];

    fontTypes?: Record<string, {regular: string; monospace: string}>;

    /**
     *  The option denies to create pools with `<Root>` parent from UI.
     */
    schedulingDenyRootAsParent?: boolean;

    /**
     * schedulingMonitoring.urlTemplate supports following parameters: {ytCluster}, {ytPool}, {ytPoolTree}.
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {urlTemplate: 'https://my.monitoring.service/scheduling?cluster={ytCluster}&pool={ytPool}&poolTree={ytPoolTree}'}
     */
    schedulingMonitoring?: UISettingsMonitoring;

    /**
     * accountsMonitoring.urlTemplate supports following parameters: {ytCluster}, {ytAccount}
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {urlTemplate: 'https://my.monitoring.service/accounts?cluster={ytCluster}&account={ytAccount}'}
     */
    accountsMonitoring?: UISettingsMonitoring;

    /**
     * bundlesMonitoring.urlTemplate supports following parameters: {ytCluster}, {ytTabletCellBundle}
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {urlTemplate: 'https://my.monitoring.service/bundles?cluster={ytCluster}&account={ytTabletCellBundle}'}
     */
    bundlesMonitoring?: UISettingsMonitoring;

    /**
     * operationsMonitoring.urlTemplate supports following parameters:
     *  {ytCluster}, {ytOperationId}, {ytPool}, {ytPoolTree}, {ytSlotIndex}, {fromTimeMs}, {toTimeMs}
     * All the parameters are optional and they are replaced with corresponding values.
     * @example {
     *   urlTemplate:
     *     'https://my.monitoring.service/operations?cluster={ytCluster}&operationId={ytOperationId}&pool={ytPool}&tree={ytPoolTree}&slot={ytSlotIndex}&from={fromTimeMs}&to={toTimeMs}'
     * }
     */
    operationsMonitoring?: UISettingsMonitoring;

    /**
     * chytMonitoring.urlTemplate supports following parameters:
     *   - {ytCluster}
     *   - {chytAlias}
     * All the parameters are optional and they are replaced with corresponding values
     * @example {
     *   urlTemplate: `https://my.monitoring.service/chyt?cluster={ytCluster}&alias={chytAlias}`
     * }
     */
    chytMonitoring?: UISettingsMonitoring;

    /**
     * systemMonitoring.urlTemplate supports following parameters:
     *  - {ytCluster}
     *  All the parameters are optional and they are replaced with corresponding values
     *  @example {
     *      urlTemplate: 'https://my.monitoring.service/system?cluster={ytCluster}'
     *  }
     */
    systemMonitoring?: UISettingsMonitoring;

    /**
     * componentVersionsMonitoring.urlTemplate supports following parameters:
     *  - {ytCluster}
     *  All the parameters are optional and they are replaced with corresponding values
     *  @example {
     *      urlTemplate: 'https://my.monitoring.service/component-versions?cluster={ytCluster}'
     *  }
     */
    componentVersionsMonitoring?: UISettingsMonitoring;

    /**
     * navigationFlowMonitoring.urlTemplate supports following parameters:
     *  - {ytCluster}
     *  - {monitoring_cluster}
     *  - {monitoring_project}
     *  All the parameters are optional and they are replaced with corresponding values
     *  @example {
     *      urlTemplate: 'https://my.monitoring.service/navigation-flow?cluster={ytCluster}&monCluster={monitoring_cluster}&monProject={monitoring_project}'
     *  }
     */
    navigationFlowMonitoring?: UISettingsMonitoring;

    /**
     * Allows to define regular expression to extract hash-part from version of node by named group 'hash'
     * @example reHashFromNodeVersion: '[^~]+(?<hash>[^+]+)'
     */
    reHashFromNodeVersion?: string;

    /**
     * Allows to define regular expression to extract short-name from full address of host by named group 'shortname'.
     *  Also it supports optional named group 'suffix' that will pe appended to shortname as is.
     * @example reShortNameFromAddress: '(?<shortname>.*)((\\.msk\\.my-domain\\.ru)|(\\.vla\\.my-domain\\.net))'
     * @example reShortNameFromAddress: '(?<shortname>.*)((\\.msk\\.my-domain\\.ru)|(\\.vla\\.my-domain\\.net))'
     */
    reShortNameFromAddress?: string;

    /**
     * Allows to override behavior of `reShortNameFromAddress` for tablet/bundles/cells specific parts of UI.
     * @example reShortNameFromTabletNodeAddress: '(?<shortname>[^-]+-[^-]+).*'
     */
    reShortNameFromTabletNodeAddress?: string;

    /**
     * Allows you to override the behavior of  'reShortNameSystemPage ` for masters / providers / schedulers / agents.
     * @example reShortNameSystemPage: '(?<shortname>.*)((\\.msk\\.my-domain\\.ru)|(\\.vla\\.my-domain\\.net))'
     */
    reShortNameSystemPage?: string;

    /**
     * Allows to define array of regexps for allowed urls of TaggedType of unipika to display media-content (audio/video/images).
     * If there are no matched items in the array the TaggedType-item will be displayed as a json-object.
     * @expamle
     * reUnipikaAllowTaggedSources: [
     *   "https:\\/\\/image\\.bank\\.my\\/fruits\\/",
     *   "https:\\/\\/image\\.bank\\.my\\/vegetables\\/"
     * ]
     */
    reUnipikaAllowTaggedSources: Array<string>;

    /**
     * Allows to define service for removing 'Referer' header for url-s on a page.
     *
     * See `@gravity-ui/unipika v3.0.0` details in [CHANGELOG.md](https://github.com/gravity-ui/unipika/blob/main/CHANGELOG.md).
     */
    hideReferrerUrl?: string;

    /**
     * Allows to customize VCS navigation on the query page, empty array will hide the tab from navigation
     * id - unique identifier of VCS
     * name - name of VCS. The name is displayed in the selector
     * baseUrl - URL to you VCS api
     * auth - 'token' | 'none'
     * maxFileSize - max file size in bytes. 10Mb by default
     * type - 'gitlab' | 'github' | `custom_vsc_type_${string}`
     *
     * @example
     * vcsSettings: [
     *             {
     *                 id: 'vcs1',
     *                 name: 'Github',
     *                 auth: 'token',
     *                 baseUrl: 'https://api.github.com',
     *                 type: 'github',
     *                 maxFileSize: 10485760,
     *             },
     *             {
     *                 id: 'vcs2',
     *                 name: 'Gitlab',
     *                 auth: 'token',
     *                 baseUrl: 'https://gitlab.com/api/v4/projects',
     *                 type: 'gitlab',
     *                 maxFileSize: 10485760,
     *             },
     *             {
     *                 id: 'My VCS realization 1',
     *                 name: 'MyVCS',
     *                 auth: 'token',
     *                 baseUrl: 'https://my_vcs_url',
     *                 type: 'custom_vsc_type_my-vcs',
     *                 maxFileSize: 10485760,
     *             },
     *             {
     *                 id: 'My VCS realization 2',
     *                 name: 'MyVCS',
     *                 baseUrl: 'https://my_vcs_url',
     *                 type: 'custom_vsc_type_my-vcs',
     *                 maxFileSize: 10485760,
     *             },
     *         ],
     */
    vcsSettings?: VCSSettings[];

    /**
     * Configuration for AI chat assistant integration.
     * baseUrl - Base URL of the AI chat API endpoint
     * model - Name of the AI model to use
     * @example
     * aiChatConfig: {
     *   baseUrl: 'https://api.openai.com/v1',
     *   model: 'gpt-4'
     * }
     */
    aiChatConfig?: AIChatConfig;

    /**
     * Allows to override idm object type to Effective ACL for objects that match the regex.
     * @example reUseEffectiveAclForPath: '//sys/access_control_object_namespaces[^/+]{0,}'
     */
    reUseEffectiveAclForPath?: string;
}

export type CustomVCSType = `custom_vsc_type_${string}`;

export interface VCSSettings {
    id: string;
    name: string;
    baseUrl: string;
    auth: 'token' | 'none';
    type: 'github' | 'gitlab' | CustomVCSType;
    maxFileSize: number;
}

export interface UISettingsMonitoring {
    urlTemplate: string;
    title?: string;
}
