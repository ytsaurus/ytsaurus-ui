import React, {useState} from 'react';
import {useHistory} from 'react-router';
import cn from 'bem-cn-lite';
import {FooterItem, PageLayoutAside} from '@gravity-ui/navigation';
import {Menu} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';

import Logo from '../../../../img/svg/appLogo.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import BugIcon from '@gravity-ui/icons/svgs/bug.svg';
import Link from '../../components/Link/Link';
import unknown from '../../../../img/user-avatar.svg';
import {AppNavigationProps} from './AppNavigationPageLayout';
import YT from '../../config/yt-config';
import UIFactory from '../../UIFactory';
import {getSettingsCluster} from '../../store/selectors/global';

import './AppNavigationComponent.scss';

const block = cn('yt-app-navigation');

function AppNavigationComponent({
    logoClassName,
    menuItems,
    currentUser,
    authWay,

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
    const settingsCluster = useSelector(getSettingsCluster);
    const history = useHistory();

    let showUserIcon = Boolean(currentUser);
    let showSettings = settingsCluster && Boolean(currentUser);

    if (authWay === 'passwd') {
        showUserIcon = Boolean(settingsCluster) && Boolean(currentUser);
        showSettings = settingsCluster && Boolean(currentUser);
    }

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
            onChangeCompact={showSettings ? onChangeCompact : undefined}
            renderFooter={({compact}) => {
                const footerItems = [
                    UIFactory.makeSupportContent(
                        {login: currentUser},
                        ({onSupportClick, supportContent}) => (
                            <React.Fragment>
                                <FooterItem
                                    key="support"
                                    compact={compact}
                                    item={{
                                        id: 'support',
                                        title: 'Report a bug',
                                        icon: BugIcon,
                                        onItemClick: onSupportClick,
                                    }}
                                />
                                {supportContent}
                            </React.Fragment>
                        ),
                    ),
                ];

                if (showSettings) {
                    footerItems.push(
                        <FooterItem
                            key="settings"
                            compact={compact}
                            item={{
                                id: 'settings',
                                title: 'Settings',
                                onItemClick: toggleSettingsVisible,
                                icon: GearIcon,
                            }}
                        />,
                    );
                }

                if (showUserIcon) {
                    footerItems.push(
                        <FooterItem
                            key="user"
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
                                            {authWay === 'passwd' && (
                                                <Menu.Item
                                                    onClick={() => history.push('/change-password')}
                                                >
                                                    Change password
                                                </Menu.Item>
                                            )}
                                            <Menu.Item href={`/api/yt/${YT.cluster}/logout`}>
                                                Logout
                                            </Menu.Item>
                                        </Menu>
                                    </div>
                                );
                            }}
                        />,
                    );
                }

                return <>{footerItems}</>;
            }}
        />
    );
}

export default React.memo(AppNavigationComponent);
