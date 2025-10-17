import React from 'react';
import cn from 'bem-cn-lite';

import {makeRoutedURL} from '../../store/location';
import Link from '../../components/Link/Link';

import {useSelector} from '../../store/redux-hooks';
import {Button, Icon} from '@gravity-ui/uikit';

import PagesPanel from './PagesPanel';
import {PagesEditorPanel} from './PagesEditorPanel';
import {getPagesOrderedByUserAndPinned} from '../../store/selectors/slideoutMenu';
import {PAGE_ICONS_BY_ID} from '../../constants/slideoutMenu';
import settingsIcon from '../../assets/img/svg/settings-2.svg';

import './PagesSettingsEditor.scss';
import {getAppBrowserHistory} from '../../store/window-store';
import {AppNavigationProps} from './AppNavigationPageLayout';

const block = cn('pages-settings-editor');

export function PagesSettingsEditor(props: {
    cluster?: string;
    className?: string;
    onItemClick: () => void;
}) {
    const {className, onItemClick, cluster} = props;
    const [isEditMode, setEditMode] = React.useState(false);

    const onShowSettings = React.useCallback(() => {
        setEditMode(!isEditMode);
    }, [isEditMode, setEditMode]);

    return (
        <div className={block(null, className)}>
            <div className={block('top')}>
                <div className={block('top-title')}>All pages</div>
                <Button
                    className={block('top-btn', {active: isEditMode})}
                    view="flat"
                    size="s"
                    onClick={onShowSettings}
                >
                    <Icon data={settingsIcon} size={24} />
                </Button>
            </div>
            <div className={block('content')}>
                {isEditMode ? (
                    <PagesEditorPanel />
                ) : (
                    <PagesPanel cluster={cluster} onItemClick={onItemClick} />
                )}
            </div>
        </div>
    );
}

export function usePagesMenuItems(cluster?: string) {
    const {pathname} = window.location;

    const pages = useSelector(getPagesOrderedByUserAndPinned);

    const clusterItems: AppNavigationProps['menuItems'] = React.useMemo(() => {
        return pages.map(({id, name}) => {
            const path = `/${cluster}/${id}`;
            const current = pathname.startsWith(path);
            const url = makeRoutedURL(path);
            return {
                id,
                current,
                icon: PAGE_ICONS_BY_ID[id],
                title: name,
                iconSize: 16,
                itemUrl: url,
                itemWrapper(p, makeItem) {
                    return (
                        <div
                            className={block('service-item')}
                            onClick={(e) => {
                                if (!e.metaKey && !e.ctrlKey) {
                                    getAppBrowserHistory().push(url);
                                }
                            }}
                        >
                            <Link
                                className={block('service-item-link', {
                                    current,
                                })}
                                routed
                                theme={'primary'}
                                url={url}
                            >
                                {makeItem(p)}
                            </Link>
                        </div>
                    );
                },
            };
        });
    }, [pages, cluster, pathname]);

    if (cluster) {
        return clusterItems;
    }

    return [];
}
