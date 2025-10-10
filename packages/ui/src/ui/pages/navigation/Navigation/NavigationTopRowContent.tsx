import React, {FocusEvent} from 'react';
import {useHistory} from 'react-router';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {Breadcrumbs, Flex, Key} from '@gravity-ui/uikit';

import {getMetrics} from '../../../common/utils/metrics';

import {
    getMode,
    getNavigationBreadcrumbs,
    getNavigationPathAttributes,
    getNavigationRestorePath,
} from '../../../store/selectors/navigation/navigation';
import {getCluster} from '../../../store/selectors/global';
import {makeRoutedURL} from '../../../store/location';
import {restoreObject} from '../../../store/actions/navigation/modals/restore-object';
import {getNavigationDefaultPath} from '../../../store/selectors/settings';
import {getFavouritePaths, isCurrentPathInFavourites} from '../../../store/selectors/favourites';
import {
    getActualPath,
    getPath,
    getTransaction,
    isNavigationFinalLoadState,
} from '../../../store/selectors/navigation';
import {navigationToggleFavourite} from '../../../store/actions/favourites';
import {
    clearTransaction,
    setTransaction,
    updatePath,
    updateView,
} from '../../../store/actions/navigation';

import Favourites from '../../../components/Favourites/Favourites';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import Link from '../../../components/Link/Link';
import Editor from '../../../components/Editor/Editor';
import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';
import MetaTable from '../../../components/MetaTable/MetaTable';
import {Escaped} from '../../../components/Text/Text';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {EditableBreadcrumbs} from '../../../components/EditableBreadcrumbs/EditableBreadcrumbs';

import PathEditor from '../../../containers/PathEditor/PathEditor';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {Page} from '../../../constants';
import {Tab} from '../../../constants/navigation';

import {inTrash} from '../../../utils/navigation/restore-object';
import {makeNavigationLink} from '../../../utils/app-url';
import {decodeEscapedAbsPath} from '../../../utils/navigation';

import './NavigationTopRowContent.scss';

const block = cn('navigation-top-row-content');

function NavigationTopRowContent() {
    const defaultPath = useSelector(getNavigationDefaultPath);

    const [editMode, setEditMode] = React.useState(false);

    const toggleEditMode = React.useCallback(() => {
        setEditMode(!editMode);
    }, [setEditMode, editMode]);

    return (
        <RowWithName page={Page.NAVIGATION} className={block()} urlParams={{path: defaultPath}}>
            <NavigationFavourites />
            <Flex justifyContent={'space-between'} alignItems={'center'} grow={1} shrink={1}>
                <NavigationBreadcrumbs onEdit={toggleEditMode} />
                <NavigationTools />
            </Flex>
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

function NavigationTargetPathButton() {
    const path = useSelector(getPath);
    const {path: target_path} = useSelector(getNavigationPathAttributes);
    const loading = !useSelector(isNavigationFinalLoadState);

    const decodedTargetPath = target_path ? decodeEscapedAbsPath(target_path) : undefined;

    if (loading || !decodedTargetPath || path === decodedTargetPath || path === '/') {
        return null;
    }

    return (
        <Link url={makeNavigationLink({path: decodedTargetPath})} routed>
            <Tooltip
                content={
                    <Flex gap={1}>
                        <MetaTable items={[{key: 'target_path', value: decodedTargetPath}]} />
                        <ClipboardButton text={target_path} inlineMargins view="flat" />
                    </Flex>
                }
                placement={'bottom'}
            >
                <Button view="flat-info" selected qa="qa:navitation:target-path">
                    <Icon awesome="link" />
                </Button>
            </Tooltip>
        </Link>
    );
}

function onCopyToClipboard() {
    getMetrics().countEvent('navigation_copy-path');
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

    const handleFocus = React.useCallback((event: FocusEvent<HTMLInputElement>) => {
        event.target?.select();
    }, []);

    return (
        <PathEditor
            className={block('path-editor')}
            autoFocus
            defaultPath={actualPath}
            onApply={handleApply}
            onCancel={hideEditor}
            onBlur={hideEditor}
            onFocus={handleFocus}
        />
    );
}

function NavigationBreadcrumbs({onEdit}: {onEdit: () => void}) {
    const bcItems = useSelector(getNavigationBreadcrumbs);
    const mode = useSelector(getMode);
    const history = useHistory();

    const items = React.useMemo(() => {
        return bcItems.map(({text, state}, index) => {
            const isLastItem = index === bcItems.length - 1;

            return (
                <Breadcrumbs.Item
                    href={makeRoutedURL(window.location.pathname, {
                        path: state.path,
                        navmode: mode === Tab.ACL ? mode : Tab.CONTENT,
                        filter: '',
                    })}
                    onClick={(e) => e.preventDefault()}
                    key={`${JSON.stringify({text, index})}`}
                >
                    {index ? (
                        <Escaped text={text} onClick={isLastItem ? onEdit : undefined} />
                    ) : (
                        <Icon awesome={'folder-tree'} face={'solid'} />
                    )}
                </Breadcrumbs.Item>
            );
        });
    }, [bcItems, mode, onEdit, window.location.pathname]);

    return (
        <EditableBreadcrumbs
            onAction={(key: Key) => {
                const {text: keyText} = JSON.parse(key as string);
                const item = bcItems.find(({text}) => text === keyText);
                if (item) {
                    const url = makeRoutedURL(window.location.pathname, {
                        path: item.state.path,
                        navmode: mode === Tab.ACL ? mode : Tab.CONTENT,
                        filter: '',
                    });
                    history.push(url);
                }
            }}
            showRoot
            view={'top-row'}
            beforeEditorContent={<NavigationTargetPathButton />}
            afterEditorContent={<NavigationPathToClipboard />}
            renderEditor={(props) => <NavigationPathEditor hideEditor={props.onBlur} />}
        >
            {items}
        </EditableBreadcrumbs>
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
        getMetrics().countEvent('navigation_refresh');
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
