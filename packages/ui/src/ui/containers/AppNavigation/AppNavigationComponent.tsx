import React, {useState} from 'react';
import cn from 'bem-cn-lite';
import axios from 'axios';

import {AsideHeader, FooterItem, MenuItem} from '@gravity-ui/navigation';
import Logo from '../../../../img/svg/appLogo.svg';
import settingsIcon from '../../../../img/svg/settings.svg';
import Link from '../../components/Link/Link';
import {ClusterConfig} from '../../../shared/yt-types';
import unknown from '../../../../img/user-avatar.svg';
import './AppNavigationComponent.scss';
import {Menu} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';

const block = cn('yt-app-navigation');

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

    panelVisible: boolean;
    panelContent: React.ReactNode;
    panelClassName: string;
    onClosePanel: () => void;

    settingsContent: React.ReactNode;
    settingsVisible: boolean;
    toggleSettingsVisible: () => void;

    compact: boolean;
    onChangeCompact: (compact: boolean) => void;
    rememberSize: (asideWidth: number) => void;
}

function AppNavigationComponent({
    className,
    logoClassName,
    children,
    menuItems,
    currentUser,

    panelContent,
    panelVisible,
    panelClassName,
    onClosePanel,

    settingsVisible,
    settingsContent,
    toggleSettingsVisible,

    compact,
    onChangeCompact,

    rememberSize,
}: AppNavigationProps) {
    const panelItems = React.useMemo(() => {
        return [
            {
                id: 'panel',
                content: panelContent,
                visible: panelVisible,
                className: panelClassName,
            },
            {
                id: 'settings',
                content: settingsContent,
                visible: settingsVisible,
            },
        ];
    }, [panelVisible, panelContent, settingsVisible, settingsContent]);

    const [popupVisible, setPopupVisible] = useState(false);
    const history = useHistory();

    return (
        <AsideHeader
            className={block(null, className)}
            multipleTooltip
            panelItems={panelItems}
            onClosePanel={onClosePanel}
            menuItems={menuItems}
            logo={{
                text: () => 'YTsaurus',
                textSize: 22,
                icon: Logo,
                iconSize: 36,
                iconClassName: logoClassName,
                wrapper: (node) => {
                    return (
                        <Link url={'/'} theme={'primary'} target="_blank">
                            {node}
                        </Link>
                    );
                },
            }}
            compact={compact}
            onChangeCompact={onChangeCompact}
            renderContent={(size) => {
                rememberSize(size.size);
                return (
                    <div
                        style={{
                            ...({
                                '--nv-aside-header-size': `${size.size}px`,
                            } as any),
                        }}
                    >
                        {children}
                    </div>
                );
            }}
            renderFooter={({compact}) => {
                return (
                    <>
                        <FooterItem
                            compact={compact}
                            item={{
                                id: 'settings',
                                title: 'Settings',
                                onItemClick: toggleSettingsVisible,
                                icon: settingsIcon,
                            }}
                        />
                        <FooterItem
                            compact={compact}
                            item={{
                                id: 'user',
                                title: currentUser,
                                onItemClick: () => {
                                    setPopupVisible(!popupVisible);
                                },
                                itemWrapper: ({title}: any, makeItem: any) => {
                                    return makeItem({
                                        title,
                                        icon: (
                                            <img
                                                className={block('user-icon')}
                                                width={40}
                                                height={40}
                                                src={unknown}
                                            />
                                        ),
                                    });
                                },
                            }}
                            enableTooltip={!popupVisible}
                            popupVisible={popupVisible}
                            onClosePopup={() => setPopupVisible(false)}
                            renderPopupContent={() => {
                                return (
                                    <div className={block('settings-ul')}>
                                        <Menu>
                                            <Menu.Item
                                                onClick={() => history.push('/change-password')}
                                            >
                                                Change password
                                            </Menu.Item>
                                            <Menu.Item
                                                onClick={() => {
                                                    axios.post('/api/yt/logout').catch(() => {});
                                                }}
                                            >
                                                Logout
                                            </Menu.Item>
                                        </Menu>
                                    </div>
                                );
                            }}
                        />
                    </>
                );
            }}
        />
    );
}

export default React.memo(AppNavigationComponent);
