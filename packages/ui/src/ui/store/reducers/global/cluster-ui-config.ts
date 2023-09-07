export interface ClusterUiConfig {
    web_json_value_format: 'schemaless' | 'yql';
    enable_per_bundle_tablet_accounting?: boolean;
    enable_per_account_tablet_accounting?: boolean;
    per_bundle_accounting_help_link?: string;
    enable_nodes_maintenance_api?: boolean;
    [key: string]: any;
}

export const defaultClusterUiConfig: Partial<ClusterUiConfig> = {};
