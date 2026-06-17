import React, {useState} from 'react';
import {useHistory} from 'react-router';
import cn from 'bem-cn-lite';
import {FooterItem, type MakeItemParams, PageLayoutAside} from '@gravity-ui/navigation';
import {Menu} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../store/redux-hooks';

import Logo from '../../assets/img/svg/appLogo.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import BugIcon from '@gravity-ui/icons/svgs/bug.svg';
import Link from '../../containers/Link/Link';
import unknown from '../../assets/img/user-avatar.svg';
import {type AppNavigationProps} from './AppNavigationPageLayout';
import {YT} from '../../config/yt-config';
import UIFactory from '../../UIFactory';
import {selectSettingsCluster} from '../../store/selectors/global';
import {importManageTokens} from '../ManageTokens';
import {ChatToggleFooterButton} from '../AiChat/ChatToggleButton';

import './AppNavigationComponent.scss';
import {selectAllowManageTokens} from '../../store/selectors/manage-tokens';
import i18n from './i18n';

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
    const dispatch = useDispatch();
    const panelItems = React.useMemo(() => {
        return [
            {
                id: 'panel',
                children: panelContent,
                open: panelVisible,
                className: panelClassName,
            },
            {
                id: 'settings',
                children: settingsContent,
                open: settingsVisible,
                size: 'auto' as const,
            },
        ];
    }, [panelVisible, panelContent, panelClassName, settingsVisible, settingsContent]);

    const [popupVisible, setPopupVisible] = useState(false);
    const settingsCluster = useSelector(selectSettingsCluster);
    const isManageTokensMenuVisible = useSelector(selectAllowManageTokens);
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
                                    id="support"
                                    compact={compact}
                                    title={i18n('action_report-bug')}
                                    icon={BugIcon}
                                    onItemClick={onSupportClick}
                                />
                                {supportContent}
                            </React.Fragment>
                        ),
                    ),
                    <ChatToggleFooterButton key="ai-chat" compact={compact} />,
                ];

                if (showSettings) {
                    footerItems.push(
                        <FooterItem
                            key="settings"
                            id="settings"
                            compact={compact}
                            title={i18n('action_settings')}
                            onItemClick={toggleSettingsVisible}
                            icon={GearIcon}
                        />,
                    );
                }

                if (showUserIcon) {
                    footerItems.push(
                        <FooterItem
                            key="user"
                            id="user"
                            compact={compact}
                            title={currentUser}
                            onItemClick={() => {
                                setPopupVisible(!popupVisible);
                            }}
                            itemWrapper={(
                                makeItemParams: MakeItemParams,
                                makeItem: (params: MakeItemParams) => React.ReactNode,
                            ) => {
                                return makeItem({
                                    ...makeItemParams,
                                    icon: (
                                        <img
                                            className={block('user-icon')}
                                            width={40}
                                            height={40}
                                            src={unknown}
                                        />
                                    ),
                                });
                            }}
                            enableTooltip={!popupVisible}
                            popupVisible={popupVisible}
                            onOpenChangePopup={(open) => {
                                if (!open) {
                                    setPopupVisible(false);
                                }
                            }}
                            renderPopupContent={() => {
                                return (
                                    <div className={block('settings-ul')}>
                                        <Menu>
                                            {authWay === 'passwd' && (
                                                <Menu.Item
                                                    onClick={() =>
                                                        history.push(
                                                            `/${YT.cluster}/change-password`,
                                                        )
                                                    }
                                                >
                                                    {i18n('action_change-password')}
                                                </Menu.Item>
                                            )}
                                            {isManageTokensMenuVisible && (
                                                <Menu.Item
                                                    onClick={() =>
                                                        importManageTokens().then((actions) => {
                                                            dispatch(
                                                                actions.openManageTokensModal(),
                                                            );
                                                            setPopupVisible(false);
                                                        })
                                                    }
                                                >
                                                    {i18n('action_manage-tokens')}
                                                </Menu.Item>
                                            )}
                                            <Menu.Item href={'/api/yt/logout'}>
                                                {i18n('action_logout')}
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
