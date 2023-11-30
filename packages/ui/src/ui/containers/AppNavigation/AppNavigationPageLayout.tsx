import React from 'react';
import {AsideFallback, MenuItem, PageLayout} from '@gravity-ui/navigation';

import {ClusterConfig} from '../../../shared/yt-types';
import {AuthWay} from '../../../shared/constants';

export interface AppNavigationProps {
    initialCompact?: boolean;
    className: string;
    children?: React.ReactNode;

    clusterConfig?: ClusterConfig;
    logoClassName: string;

    menuItems: Array<
        Omit<MenuItem, 'title' | 'type'> & {itemUrl?: string; current?: boolean; title: string}
    >;
    currentUser: string;

    authWay: AuthWay;

    panelVisible: boolean;
    panelContent: React.ReactNode;
    panelClassName: string;
    onClosePanel: () => void;

    settingsContent: React.ReactNode;
    settingsVisible: boolean;
    toggleSettingsVisible: () => void;

    compact: boolean;
    onChangeCompact: (compact: boolean) => void;
}

const Aside = React.lazy(() => import('./AppNavigationComponent'));

export function AppNavigationPageLayout(props: AppNavigationProps) {
    const {onChangeCompact, className, compact, ...rest} = props;

    return (
        <PageLayout compact={compact} className={className}>
            <React.Suspense fallback={<AsideFallback />}>
                <Aside {...rest} onChangeCompact={onChangeCompact} />
            </React.Suspense>

            <PageLayout.Content>{props.children}</PageLayout.Content>
        </PageLayout>
    );
}

export default React.memo(AppNavigationPageLayout);
