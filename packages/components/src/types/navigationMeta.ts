import type {ReactNode} from 'react';
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

export type MetaTableRenderMarkdownParams = {
    text: string;
    allowHTML?: boolean;
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

export type TYComponentsNavigationMetaConfig = Partial<{
    SubjectCard: (props: SubjectCardProps) => ReactNode;
    AccountLink: (props: MetaTableAccountLinkProps) => ReactNode;
    TabletCellBundleLink: (props: MetaTableTabletCellBundleLinkProps) => ReactNode;
    ChaosCellBundleLink: (props: MetaTableChaosCellBundleLinkProps) => ReactNode;
    renderMetaOperationLink: (
        params: MetaTableOperationLinkParams,
    ) => MetaTableItem | MetaTableItem[] | null | undefined;
    renderMarkdown: (params: MetaTableRenderMarkdownParams) => ReactNode;
    renderMetaTableAutomaticModeSwitch: (params: MetaTableAutomaticModeSwitchParams) => ReactNode;
    navigationLinkTemplate: NavigationLinkTemplate;
    docsUrls: Record<YtComponentsDocsUrlKey, string>;
}>;
