import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import Favourites from '../../../components/Favourites/Favourites';
import {useDispatch, useSelector} from 'react-redux';
import {getFavouritePaths, isCurrentPathInFavourites} from '../../../store/selectors/favourites';
import {getActualPath, getPath, getTransaction} from '../../../store/selectors/navigation';
import {navigationToggleFavourite} from '../../../store/actions/favourites';
import {
    clearTransaction,
    setTransaction,
    updatePath,
    updateView,
} from '../../../store/actions/navigation';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
// @ts-ignore
import metrics from '../../../common/utils/metrics';

import {Breadcrumbs, BreadcrumbsItem} from '@gravity-ui/uikit';
import {
    getMode,
    getNavigationBreadcrumbs,
    getNavigationRestorePath,
} from '../../../store/selectors/navigation/navigation';

import {getCluster} from '../../../store/selectors/global';
import {makeRoutedURL} from '../../../store/location';
import Link from '../../../components/Link/Link';
import Editor from '../../../components/Editor/Editor';
import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';

import {Page} from '../../../constants';
import {restoreObject} from '../../../store/actions/navigation/modals/restore-object';
import {inTrash} from '../../../utils/navigation/restore-object';
import {EditButton} from '../../../components/EditableAsText/EditableAsText';
import PathEditor from '../../../containers/PathEditor/PathEditor';
import {getNavigationDefaultPath} from '../../../store/selectors/settings';
import {Tab} from '../../../constants/navigation';

import './NavigationTopRowContent.scss';
import {Escaped} from '../../../components/Text/Text';
import {useHistory} from 'react-router';

const block = cn('navigation-top-row-content');

function NavigationTopRowContent() {
    const defaultPath = useSelector(getNavigationDefaultPath);
    return (
        <RowWithName page={Page.NAVIGATION} className={block()} urlParams={{path: defaultPath}}>
            <NavigationFavourites />
            <EditableNavigationBreadcrumbs />
            <NavigationTools />
        </RowWithName>
    );
}

function NavigationFavourites() {
    const dispatch = useDispatch();

    const favourites = useSelector(getFavouritePaths);

    const isInFavourites = useSelector(isCurrentPathInFavourites);
    const path = useSelector(getPath);

    const handleToggle = React.useCallback(() => {
        dispatch(navigationToggleFavourite(path));
    }, [dispatch, path]);

    const handleItemClick = React.useCallback(
        ({path}: {path: string}) => {
            dispatch(updatePath(path));
        },
        [dispatch],
    );

    return (
        <Favourites
            theme={'clear'}
            isActive={isInFavourites}
            items={favourites || []}
            onItemClick={handleItemClick}
            onToggle={handleToggle}
        />
    );
}

function NavigationPathToClipboard() {
    const path = useSelector(getPath);
    return (
        <span className={block('to-clipboard')}>
            <ClipboardButton
                text={path}
                title="Copy to clipboard [Shift+P]"
                className={'navigation__instruments-control'}
                hotkey="shift+p"
                onCopy={onCopyToClipboard}
            />
        </span>
    );
}

function onCopyToClipboard() {
    metrics.countEvent({'navigation_copy-path': 'clicked'});
}

function EditableNavigationBreadcrumbs() {
    const [editMode, setEditMode] = React.useState(false);

    const toggleEditMode = React.useCallback(() => {
        setEditMode(!editMode);
    }, [setEditMode, editMode]);

    return (
        <div className={block('editable-breadcrumbs')}>
            {editMode ? (
                <NavigationPathEditor hideEditor={toggleEditMode} />
            ) : (
                <React.Fragment>
                    <NavigationBreadcrumbs onEdit={toggleEditMode} />
                    <EditButton onClick={toggleEditMode} />
                    <NavigationPathToClipboard />
                </React.Fragment>
            )}
        </div>
    );
}

function NavigationPathEditor({hideEditor}: {hideEditor: () => void}) {
    const dispatch = useDispatch();
    const actualPath = useSelector(getActualPath);

    const handleApply = React.useCallback(
        (path: string) => {
            if (path !== actualPath) {
                dispatch(updatePath(path.endsWith('/') ? path.slice(0, -1) : path));
            }
            hideEditor();
        },
        [hideEditor],
    );

    return (
        <PathEditor
            className={block('path-editor')}
            autoFocus
            defaultPath={actualPath}
            onApply={handleApply}
            onCancel={hideEditor}
            onBlur={hideEditor}
            onFocus={(e) => e.target.select()}
        />
    );
}

function NavigationBreadcrumbs({onEdit}: {onEdit: () => void}) {
    const bcItems = useSelector(getNavigationBreadcrumbs);
    const mode = useSelector(getMode);
    const history = useHistory();
    const items = React.useMemo(() => {
        return map_(bcItems, ({text, state}) => {
            const url = makeRoutedURL(window.location.pathname, {
                path: state.path,
                navmode: mode === Tab.ACL ? mode : Tab.CONTENT,
                filter: '',
            });

            return {
                text,
                url,
                state,
                action: (event: any) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!event.ctrlKey && !event.metaKey && event.button !== 1) {
                        history.push(url);
                    } else {
                        window.open(url);
                    }
                },
            };
        });
    }, [bcItems, mode]);

    const cluster = useSelector(getCluster);

    const renderItem = React.useCallback(
        (item: BreadcrumbsItem, isCurrent: boolean) => {
            return <NavigationBcItem {...{item, isCurrent, onEdit}} />;
        },
        [cluster, onEdit],
    );

    const renderRoot = React.useCallback(
        (item: BreadcrumbsItem, isCurrent: boolean) => {
            return (
                <NavigationBcItem
                    item={{
                        ...item,
                        text: '/',
                    }}
                    {...{isCurrent, isRoot: true, onEdit}}
                />
            );
        },
        [cluster, onEdit],
    );

    return (
        <div className={block('breadcrumbs')}>
            <Breadcrumbs
                className={block('breadcrumbs')}
                items={items}
                lastDisplayedItemsCount={2}
                firstDisplayedItemsCount={1}
                renderItemContent={renderItem}
                renderRootContent={renderRoot}
            />
        </div>
    );
}

function NavigationBcItem({
    item,
    isCurrent,
    isRoot,
    onEdit,
}: {
    item: BreadcrumbsItem;
    isCurrent: boolean;
    isRoot?: boolean;
    onEdit: () => void;
}) {
    const url = (item as any).url;

    return (
        <Link
            className={block('breadcrumbs-link', {
                current: isCurrent,
                root: isRoot,
            })}
            url={url}
            routed
            onClick={
                !isCurrent
                    ? (e) => {
                          e.preventDefault();
                      }
                    : (e) => {
                          onEdit();
                          e.preventDefault();
                      }
            }
        >
            {!isRoot ? (
                <Escaped text={item.text} />
            ) : (
                <span className={block('breadcrumbs-root')}>
                    <Icon awesome={'folder-tree'} face={'solid'} />
                </span>
            )}
        </Link>
    );
}

function NavigationTools() {
    return (
        <div className={block('tools')}>
            <Transaction />
            <RefreshButton />
            <RestoreButton />
        </div>
    );
}

function Transaction() {
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const transaction = useSelector(getTransaction);
    const [editMode, setEditMode] = React.useState(false);

    const handleClearTransaction = React.useCallback(() => {
        dispatch(clearTransaction());
    }, [dispatch]);

    const handleEdit = React.useCallback(
        (value: string) => {
            dispatch(setTransaction(value));
            setEditMode(false);
        },
        [dispatch, setEditMode],
    );

    const toggleEditMode = React.useCallback(() => {
        setEditMode(!editMode);
    }, [setEditMode, editMode]);

    if (transaction) {
        return (
            <div className={block('transaction')}>
                <span className="elements-ellipsis">
                    <Link
                        routed
                        url={`/${cluster}/${Page.NAVIGATION}?path=//sys/transactions/${transaction}`}
                    >
                        {transaction}
                    </Link>
                </span>
                <Button
                    size="m"
                    view="flat-secondary"
                    title="Clear transaction"
                    onClick={handleClearTransaction}
                >
                    <Icon awesome="times" />
                </Button>
            </div>
        );
    } else {
        return editMode ? (
            <Editor
                size="s"
                scope="transaction-editor"
                visible={true}
                value={transaction}
                placeholder="Enter id..."
                onApply={handleEdit}
                onCancel={toggleEditMode}
                cancelOnBlur
            />
        ) : (
            <Button view="flat-secondary" size="m" title="Set transaction" onClick={toggleEditMode}>
                <Icon awesome="code-branch" />
            </Button>
        );
    }
}

function RefreshButton() {
    const dispatch = useDispatch();

    const handleClick = React.useCallback(() => {
        metrics.countEvent({
            navigation_refresh: 'clicked',
        });
        dispatch(updateView());
    }, [dispatch]);

    return (
        <Button
            size="s"
            view="flat-secondary"
            title={'Refresh page [Shift+R]'}
            hotkey={[{keys: 'shift+r', handler: handleClick, scope: 'all'}]}
            onClick={handleClick}
        >
            <Icon awesome={'sync-alt'} />
        </Button>
    );
}

function RestoreButton() {
    const dispatch = useDispatch();
    const path = useSelector(getPath);
    const restorePath = useSelector(getNavigationRestorePath);

    const handleRestore = React.useCallback(() => {
        dispatch(restoreObject(path, restorePath));
    }, [dispatch, restorePath, path]);

    return !restorePath || !inTrash(path) ? null : (
        <span className={block('restore')}>
            <Button view="action" size="s" onClick={handleRestore}>
                <Icon awesome="undo" />
                &nbsp;Restore
            </Button>
        </span>
    );
}

export default React.memo(NavigationTopRowContent);
