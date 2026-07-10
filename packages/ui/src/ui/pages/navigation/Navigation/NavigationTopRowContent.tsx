import React, {type FocusEvent} from 'react';
import {useHistory} from 'react-router';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {Breadcrumbs, Flex, type Key} from '@gravity-ui/uikit';

import {getMetrics} from '../../../common/utils/metrics';

import {
    selectMode,
    selectNavigationBreadcrumbs,
    selectNavigationPathAttributes,
    selectNavigationRestorePath,
} from '../../../store/selectors/navigation/navigation';
import {selectCluster} from '../../../store/selectors/global';
import {makeRoutedURL} from '../../../store/location';
import {restoreObject} from '../../../store/actions/navigation/modals/restore-object';
import {selectNavigationDefaultPath} from '../../../store/selectors/settings';
import {
    selectActualPath,
    selectIsNavigationFinalLoadState,
    selectPath,
    selectTransaction,
} from '../../../store/selectors/navigation';
import {
    clearTransaction,
    setTransaction,
    updatePath,
    updateView,
} from '../../../store/actions/navigation';

import {NavigationFavorites} from '../../../containers/NavigationFavorites';
import {type FavouritesItem} from '../../../components/Favourites/Favourites';
import {ClipboardButton, Escaped, MetaTable, Tooltip} from '@ytsaurus/components';
import Link from '../../../containers/Link/Link';
import Editor from '../../../components/Editor/Editor';
import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';
import {EditableBreadcrumbs} from '../../../components/EditableBreadcrumbs/EditableBreadcrumbs';

import PathEditor from '../../../containers/PathEditor/PathEditor';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {Page} from '../../../constants';
import {Tab} from '../../../constants/navigation';

import {inTrash} from '../../../utils/navigation/restore-object';
import {makeNavigationLink} from '../../../utils/app-url';
import {decodeEscapedAbsPath} from '../../../utils/navigation';

import i18n from './i18n';

import './NavigationTopRowContent.scss';

const block = cn('navigation-top-row-content');

function NavigationTopRowContent() {
    const defaultPath = useSelector(selectNavigationDefaultPath);

    const [editMode, setEditMode] = React.useState(false);

    const toggleEditMode = React.useCallback(() => {
        setEditMode(!editMode);
    }, [setEditMode, editMode]);

    return (
        <RowWithName page={Page.NAVIGATION} className={block()} urlParams={{path: defaultPath}}>
            <NavigationFavourites />
            <Flex
                justifyContent={'space-between'}
                alignItems={'center'}
                grow={1}
                shrink={1}
                overflow="hidden"
            >
                <NavigationBreadcrumbs onEdit={toggleEditMode} />
                <NavigationTools />
            </Flex>
        </RowWithName>
    );
}

function NavigationFavourites() {
    const dispatch = useDispatch();
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);

    const handleItemClick = React.useCallback(
        (item: FavouritesItem) => {
            dispatch(updatePath(item.path));
        },
        [dispatch],
    );

    return <NavigationFavorites path={path} cluster={cluster} onItemClick={handleItemClick} />;
}

function NavigationPathToClipboard() {
    const path = useSelector(selectPath);
    return (
        <span className={block('to-clipboard')}>
            <ClipboardButton
                text={path}
                title={i18n('action_copy-to-clipboard')}
                className={'navigation__instruments-control'}
                hotkey="shift+p"
                onCopy={onCopyToClipboard}
            />
        </span>
    );
}

function NavigationTargetPathButton({decodedTargetPath}: {decodedTargetPath: string}) {
    return (
        <Link url={makeNavigationLink({path: decodedTargetPath})} routed>
            <Tooltip
                content={
                    <Flex gap={1}>
                        <MetaTable items={[{key: 'target_path', value: decodedTargetPath}]} />
                        <ClipboardButton text={decodedTargetPath} inlineMargins view="flat" />
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
    const actualPath = useSelector(selectActualPath);

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
    const bcItems = useSelector(selectNavigationBreadcrumbs);
    const mode = useSelector(selectMode);
    const history = useHistory();

    const lastClickWasModified = React.useRef(false);

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
                    onClick={(e) => {
                        const isModifiedClick = e.ctrlKey || e.metaKey || e.shiftKey;
                        lastClickWasModified.current = isModifiedClick;
                        if (!isModifiedClick) {
                            e.preventDefault();
                        }
                    }}
                    key={`${JSON.stringify({text, index})}`}
                >
                    {index ? (
                        <Escaped text={text} onClick={isLastItem ? onEdit : undefined} />
                    ) : (
                        <Icon awesome={'folder-tree'} face={'solid'} size={15} />
                    )}
                </Breadcrumbs.Item>
            );
        });
    }, [bcItems, mode, onEdit]);

    const loading = !useSelector(selectIsNavigationFinalLoadState);

    const path = useSelector(selectPath);
    const {path: target_path} = useSelector(selectNavigationPathAttributes);
    const decodedTargetPath = target_path ? decodeEscapedAbsPath(target_path) : undefined;

    const showBeforeEditorContent =
        !loading && decodedTargetPath && path !== decodedTargetPath && path !== '/';

    return (
        <EditableBreadcrumbs
            onAction={(key: Key) => {
                if (lastClickWasModified.current) {
                    lastClickWasModified.current = false;
                    return;
                }
                const {index} = JSON.parse(key as string);
                const item = bcItems[index];
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
            beforeEditorContent={
                showBeforeEditorContent ? (
                    <NavigationTargetPathButton decodedTargetPath={decodedTargetPath} />
                ) : null
            }
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

    const cluster = useSelector(selectCluster);
    const transaction = useSelector(selectTransaction);
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
                    title={i18n('action_clear-transaction')}
                    onClick={handleClearTransaction}
                >
                    <Icon awesome="times" size={13} />
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
                placeholder={i18n('context_enter-id')}
                onApply={handleEdit}
                onCancel={toggleEditMode}
                cancelOnBlur
            />
        ) : (
            <Button
                view="flat-secondary"
                size="m"
                title={i18n('action_set-transaction')}
                onClick={toggleEditMode}
            >
                <Icon awesome="code-branch" size={13} />
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
            title={i18n('action_refresh-page')}
            hotkey={[{keys: 'shift+r', handler: handleClick, scope: 'all'}]}
            onClick={handleClick}
        >
            <Icon awesome={'sync-alt'} size={13} />
        </Button>
    );
}

function RestoreButton() {
    const dispatch = useDispatch();
    const path = useSelector(selectPath);
    const restorePath = useSelector(selectNavigationRestorePath);

    const handleRestore = React.useCallback(() => {
        dispatch(restoreObject(path, restorePath));
    }, [dispatch, restorePath, path]);

    return !restorePath || !inTrash(path) ? null : (
        <span className={block('restore')}>
            <Button view="action" size="s" onClick={handleRestore}>
                <Icon awesome="undo" size={13} />
                &nbsp;{i18n('action_restore')}
            </Button>
        </span>
    );
}

export default React.memo(NavigationTopRowContent);
