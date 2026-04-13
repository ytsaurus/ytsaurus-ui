import type {MetaTableItem} from '../components';

export type MetaTableAutomaticModeSwitchOnEdit = (currentValue?: boolean) => Promise<void>;

type SubjectCardProps = {
    className?: string;
    noLink?: boolean;
    showIcon?: boolean;
    internal?: boolean;
    url?: string;
    name: string | number;
    type?: 'user' | 'group' | 'tvm';
    groupType?: 'service' | 'department' | string;
};

type MetaTableAccountLinkProps = {
    className?: string;
    account?: string;
    cluster?: string;
    inline?: boolean;
};

type MetaTableTabletCellBundleLinkProps = {
    className?: string;
    tabletCellBundle?: string;
    cluster?: string;
    inline?: boolean;
};

type MetaTableChaosCellBundleLinkProps = {
    className?: string;
    chaosCellBundle?: string;
    cluster?: string;
    inline?: boolean;
};

export type MetaTableOperationLinkParams = {
    operationId: string;
    cluster: string;
};

export type MetaTableAutomaticModeSwitchParams = {
    value?: boolean;
    cluster: string;
    onEdit?: MetaTableAutomaticModeSwitchOnEdit;
};

export type NavigationLinkTemplate = (params: {
    cluster?: string;
    path: string;
}) => string | undefined;

export type YtComponentsDocsUrlKey = 'cypress:ttl' | 'storage:replication#erasure';

export type TYComponentsNavigationMetaConfig = {
    SubjectCard?: (props: SubjectCardProps) => React.ReactNode;
    AccountLink?: (props: MetaTableAccountLinkProps) => React.ReactNode;
    TabletCellBundleLink?: (props: MetaTableTabletCellBundleLinkProps) => React.ReactNode;
    ChaosCellBundleLink?: (props: MetaTableChaosCellBundleLinkProps) => React.ReactNode;
    renderMetaOperationLink?: (
        params: MetaTableOperationLinkParams,
    ) => MetaTableItem | MetaTableItem[] | null | undefined;
    renderMetaTableAutomaticModeSwitch?: (
        params: MetaTableAutomaticModeSwitchParams,
    ) => React.ReactNode;
    navigationLinkTemplate?: NavigationLinkTemplate;
    docsUrls?: Record<YtComponentsDocsUrlKey, string>;
};
