import React, {useState} from 'react';
import cn from 'bem-cn-lite';
import axios from 'axios';
import {useHistory} from 'react-router';
import {FooterItem, PageLayoutAside} from '@gravity-ui/navigation';
import {Menu} from '@gravity-ui/uikit';

import Logo from '../../../../img/svg/appLogo.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import Link from '../../components/Link/Link';
import unknown from '../../../../img/user-avatar.svg';
import {AppNavigationProps} from './AppNavigationPageLayout';

import './AppNavigationComponent.scss';

const block = cn('yt-app-navigation');

function AppNavigationComponent({
    logoClassName,
    menuItems,
    currentUser,

    panelContent,
    panelVisible,
    panelClassName,
    onClosePanel,

    settingsVisible,
    settingsContent,
    toggleSettingsVisible,

    onChangeCompact,
}: Omit<AppNavigationProps, 'compact' | 'rememberSize' | 'className'>) {
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
        <PageLayoutAside
            multipleTooltip
            panelItems={panelItems}
            onClosePanel={onClosePanel}
            menuItems={menuItems}
            headerDecoration
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
            onChangeCompact={onChangeCompact}
            renderFooter={({compact}) => {
                return (
                    <>
                        <FooterItem
                            compact={compact}
                            item={{
                                id: 'settings',
                                title: 'Settings',
                                onItemClick: toggleSettingsVisible,
                                icon: GearIcon,
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
