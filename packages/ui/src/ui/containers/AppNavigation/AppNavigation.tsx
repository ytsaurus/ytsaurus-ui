import React from 'react';
import cn from 'bem-cn-lite';
import _some from 'lodash/some';
import _isEmpty from 'lodash/isEmpty';

import ellipsisIcon from '../../../../img/svg/ellipsis.svg';

import {useDispatch, useSelector} from 'react-redux';

import {PagesSettingsEditor, usePagesMenuItems} from './PagesSettingsEditor';
import {
    getClusterConfigByName,
    getCurrentUserName,
    getRootPagesCluster,
} from '../../store/selectors/global';

import SettingsPanel from '../SettingsPanel/SettingsPanel';
import {useClusterFromLocation} from '../../hooks/use-cluster';

import './AppNavigation.scss';
import UIFactory from '../../UIFactory';
import {AppNavigationProps} from './AppNavigationComponent';
import {getSettingNavigationPanelExpanded} from '../../store/selectors/settings';
import {setSettingNavigationPanelExpanded} from '../../store/actions/settings/settings';

const block = cn('app-navigation');

interface ExtProps {
    children: React.ReactNode;
}

function isRootPage(cluster = '') {
    return _some(UIFactory.getExtraRootPages(), (info) => {
        return cluster === info.pageId;
    });
}

export default function AppNavigation({children}: ExtProps) {
    const dispatch = useDispatch();
    const pageOrCluster = useClusterFromLocation();
    const rootPageCluster = useSelector(getRootPagesCluster);
    const cluster = isRootPage(pageOrCluster) ? rootPageCluster : pageOrCluster;
    const clusterConfig = getClusterConfigByName(cluster || '');

    const items = usePagesMenuItems(cluster);
    const currentUser = useSelector(getCurrentUserName);

    const [settingsVisible, setSettingsVisible] = React.useState(false);
    const [panelVisible, setPanelVisible] = React.useState(false);

    const onClosePanel = React.useCallback(() => {
        setSettingsVisible(false);
        setPanelVisible(false);
    }, []);

    const togglePanelVisibility = React.useCallback(() => {
        setSettingsVisible(false);
        setPanelVisible(!panelVisible);
    }, [panelVisible]);

    const toggleSettingsVisible = React.useCallback(() => {
        setPanelVisible(false);
        setSettingsVisible(!settingsVisible);
    }, [settingsVisible]);

    const menuItems: typeof items = React.useMemo(() => {
        if (!cluster) {
            return [];
        }
        return [
            ...items,
            {
                id: 'all_pages',
                title: 'All pages',
                icon: ellipsisIcon,
                current: false,
                onItemClick: togglePanelVisibility,
                iconSize: 24,
            },
        ];
    }, [items, cluster, togglePanelVisibility]);

    const expanded = useSelector(getSettingNavigationPanelExpanded);
    const onChangeCompact = React.useCallback((newCompact: boolean) => {
        dispatch(setSettingNavigationPanelExpanded(!newCompact));
    }, []);

    const props: AppNavigationProps = {
        className: block(),
        clusterConfig,
        logoClassName: block('logo-icon', {'no-cluster': !cluster}),
        currentUser,
        menuItems: _isEmpty(clusterConfig) ? [] : menuItems,
        panelContent: (
            <PagesSettingsEditor
                cluster={cluster}
                className={block('panel-content')}
                onItemClick={onClosePanel}
            />
        ),
        panelClassName: block('panel'),
        panelVisible,
        onClosePanel,
        settingsContent: <SettingsPanel />,
        settingsVisible,
        toggleSettingsVisible,

        compact: !expanded,
        onChangeCompact,
        children,
    };

    return UIFactory.renderAppNavigation(props);
}
