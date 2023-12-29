import React, {Component, Fragment} from 'react';
import {StickyContainer} from 'react-sticky';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../common/hammer';
import ypath from '../../../common/thor/ypath';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import {getCluster, getUISizes} from '../../../store/selectors/global';
import {updateTitle} from '../../../store/actions/global';

import {
    CopyObjectModal,
    CreateDirectoryModal,
    DeleteObjectModal,
    MoveObjectModal,
    RestoreObjectModal,
} from './PathEditorModal';
import RequestPermissions from '../../../pages/navigation/tabs/ACL/RequestPermissions/RequestPermissions';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import ContentViewer from './ContentViewer/ContentViewer';
import Error from '../../../components/Error/Error';
import {Info} from '../../../components/Info/Info';
import Tabs from '../../../components/Tabs/Tabs';

import {Tab} from '../../../constants/navigation';
import {LOADING_STATUS} from '../../../constants/index';

import {onTransactionChange, setMode, updateView} from '../../../store/actions/navigation';

import {
    getAttributes,
    getError,
    getIdmSupport,
    getLoadState,
    getParsedPath,
    getPath,
    getTransaction,
    getType,
    isNavigationFinalLoadState,
} from '../../../store/selectors/navigation';
import {getEffectiveMode, getSupportedTabs} from '../../../store/selectors/navigation/navigation';
import {NavigationPermissionsNotice} from './NavigationPermissionsNotice';
import {useRumMeasureStop} from '../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import AttributesEditor from '../modals/AttributesEditor';
import RemoteCopyModal from '../modals/RemoteCopyModal';
import TableEraseModal from '../modals/TableEraseModal';
import TableSortModal from '../modals/TableMergeSortModal/TableSortModal';
import TableMergeModal from '../modals/TableMergeSortModal/TableMergeModal';
import DynTablesStateModal from '../modals/DynTablesStateModal';
import LinkToModal from '../modals/LinkToModal';
import CreateACOModal from '../modals/CreateACOModal';
import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';
import {showNavigationAttributesEditor} from '../../../store/actions/navigation/modals/attributes-editor';
import {getTabletErrorsCount} from '../../../store/selectors/navigation/tabs/tablet-errors';
import {getPermissionDeniedError} from '../../../utils/errors';
import {getParentPath} from '../../../utils/navigation';
import UIFactory from '../../../UIFactory';

import './Navigation.scss';

const block = cn('navigation');

function renderModals() {
    return (
        <Fragment>
            <RestoreObjectModal />
            <CreateDirectoryModal />
            <MoveObjectModal />
            <CopyObjectModal />
            <DeleteObjectModal />
            <AttributesEditor />
            <TableEraseModal />
            <TableSortModal />
            <TableMergeModal />
            <DynTablesStateModal />
            <LinkToModal />
            <CreateACOModal />
            <RemoteCopyModal />
        </Fragment>
    );
}

class Navigation extends Component {
    static propTypes = {
        // from connect
        cluster: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        mode: PropTypes.string.isRequired,
        isIdmSupported: PropTypes.bool.isRequired,
        transaction: PropTypes.string,
        parsedPath: PropTypes.object,
        type: PropTypes.string,
        supportedTabs: PropTypes.object.isRequired, // actually it's ES6 Set
        attributes: PropTypes.object.isRequired,

        hasError: PropTypes.bool,
        error: PropTypes.shape({
            message: PropTypes.string,
            inner_errors: PropTypes.arrayOf(
                PropTypes.shape({
                    message: PropTypes.string,
                    details: PropTypes.shape({
                        code: PropTypes.number,
                        object_type: PropTypes.string,
                    }),
                }),
            ),
        }),
        loaded: PropTypes.bool,
        loading: PropTypes.bool,

        setMode: PropTypes.func.isRequired,
        updateView: PropTypes.func.isRequired,
        onTransactionChange: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.updateView({trackVisit: true});
        this.updateTitleWithPath();
    }

    componentDidUpdate(prevProps) {
        const {transaction, path, updateView, onTransactionChange} = this.props;
        const {transaction: prevTransaction, path: prevPath} = prevProps;

        if (transaction !== prevTransaction) {
            onTransactionChange();
        } else if (path !== prevPath) {
            updateView({trackVisit: true});
        }

        if (this.props.parsedPath !== prevProps.parsedPath) {
            this.updateTitleWithPath();
        }
    }

    componentWillUnmount() {
        this.props.updateTitle({path: ''});
    }

    updateTitleWithPath() {
        const {parsedPath, updateTitle} = this.props;
        updateTitle({path: parsedPath ? parsedPath.getKey() : ''});
    }

    get items() {
        const {setMode, attributes, tabletErrorsCount} = this.props;
        const isACO = attributes?.type === 'access_control_object';

        return [
            {
                value: Tab.CONSUMER,
                title: 'Go to consumer [Alt+R]',
                hotkey: [
                    {
                        keys: 'alt+r',
                        handler: () => setMode(Tab.CONSUMER),
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.CONTENT,
                title: 'Go to content [Alt+C]',
                text: isACO ? 'Principal ACL' : undefined,
                hotkey: [
                    {
                        keys: 'alt+c',
                        handler: () => setMode(Tab.CONTENT),
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.QUEUE,
                title: 'Go to queue [Alt+Q]',
                hotkey: [
                    {
                        keys: 'alt+q',
                        handler: () => setMode(Tab.QUEUE),
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.ATTRIBUTES,
                title: 'Go to attributes [Alt+A]',
                hotkey: [
                    {
                        keys: 'alt+a',
                        handler: () => setMode(Tab.ATTRIBUTES),
                        scope: 'all',
                    },
                ],
                caption: 'Attributes',
            },
            {
                value: Tab.USER_ATTRIBUTES,
                title: 'Go to user attributes [Alt+U]',
                hotkey: [
                    {
                        keys: 'alt+u',
                        handler: () => setMode(Tab.USER_ATTRIBUTES),
                        scope: 'all',
                    },
                ],
                caption: 'User Attributes',
            },
            {
                value: Tab.MOUNT_CONFIG,
                title: 'Go to mount config',
                hotkey: [
                    {
                        keys: 'alt+m',
                        handler: () => setMode(Tab.MOUNT_CONFIG),
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.ACL,
                title: 'Go to ACL [Alt+P]',
                hotkey: [
                    {
                        keys: 'alt+p',
                        handler: () => setMode(Tab.ACL),
                        scope: 'all',
                    },
                ],
                caption: 'ACL',
            },
            {
                value: Tab.ACCESS_LOG,
                title: 'Access log',
            },
            {
                value: Tab.LOCKS,
                title: 'Go to locks [Alt+L]',
                hotkey: [
                    {
                        keys: 'alt+l',
                        handler: () => setMode(Tab.LOCKS),
                        scope: 'all',
                    },
                ],
                counter: ypath.getValue(attributes, '/lock_count'),
            },
            {
                value: Tab.ANNOTATION,
                title: 'Go to annotation [Alt+N]',
                hotkey: [
                    {
                        keys: 'alt+n',
                        handler: () => setMode(Tab.ACL),
                        scope: 'all',
                    },
                ],
                caption: 'Annotation',
            },
            {
                value: Tab.SCHEMA,
                title: 'Go to schema [Alt+S]',
                hotkey: [
                    {
                        keys: 'alt+s',
                        handler: () => setMode(Tab.SCHEMA),
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.TABLETS,
                title: 'Go to tablets [Alt+T]',
                hotkey: [
                    {
                        keys: 'alt+t',
                        handler: () => setMode(Tab.TABLETS),
                        scope: 'all',
                    },
                ],
            },
            {
                value: Tab.TABLET_ERRORS,
                title: 'Go to tablets errors',
                counter: tabletErrorsCount,
            },
        ];
    }

    onTabChange = (value) => {
        const {setMode} = this.props;
        setMode(value);
    };

    renderTabs() {
        const {mode, supportedTabs, tabSize} = this.props;
        const items = _.map(this.items, (item) => ({
            ...item,
            text: item.text || hammer.format['ReadableField'](item.value),
            show: supportedTabs.has(item.value),
        }));

        return (
            <Tabs
                onTabChange={this.onTabChange}
                active={mode}
                items={items}
                underline
                size={tabSize}
            />
        );
    }

    renderEditButton() {
        return (
            <div className={block('edit-metadata')}>
                <Button size="m" title={'Edit metadata'} onClick={this.onEditButtonClick}>
                    <Icon awesome={'pencil'} />
                    Edit metadata
                </Button>
            </div>
        );
    }

    onEditButtonClick = () => {
        const {path, showNavigationAttributesEditor} = this.props;
        showNavigationAttributesEditor([path]);
    };

    renderPlaceholder() {
        const {type = 'unknown', mode, loading} = this.props;

        if (type === 'unknown' && loading) {
            return null;
        }

        return (
            <div className="navigation__warning elements-message elements-message_theme_warning">
                {mode === Tab.CONTENT ? (
                    <p className="elements-message__paragraph">
                        Viewing node of type <strong>{type}</strong> is not supported in navigator.
                    </p>
                ) : (
                    <p className="elements-message__paragraph">
                        Viewing node attribute <strong>{mode}</strong> is not supported in
                        navigator.
                    </p>
                )}
            </div>
        );
    }

    renderView() {
        const {type, mode} = this.props;
        const isSupported = ContentViewer.isSupported(type, mode);

        if (isSupported) {
            return <ContentViewer type={type} mode={mode} />;
        }

        return this.renderPlaceholder();
    }

    renderError() {
        const {
            error: {message, details},
            isIdmSupported,
        } = this.props;

        // Looking for permission denied error
        const permissionDeniedError = getPermissionDeniedError(details);
        const isPermissionDenied = permissionDeniedError && isIdmSupported;

        return (
            <div>
                <div className={block('error-block')}>
                    <Error
                        className={block('error-block')}
                        message={message}
                        error={permissionDeniedError ?? details}
                    />
                    {isPermissionDenied && this.renderRequestPermission(permissionDeniedError)}
                </div>
            </div>
        );
    }

    renderRequestPermission(error) {
        const {object_type: objectType} = error.attributes;
        const {path, cluster} = this.props;
        const isRequestPermissionsForPathAllowed = objectType === 'map_node';

        const pathForRequest = isRequestPermissionsForPathAllowed ? path : getParentPath(path);
        const textForRequest = isRequestPermissionsForPathAllowed
            ? 'Request permission'
            : 'Request permission for parent node';

        return (
            <div>
                {!isRequestPermissionsForPathAllowed &&
                    this.renderRequestPermissionIsNotAllowed(objectType)}

                <RequestPermissions
                    className={block('error-action-button')}
                    parentPath={pathForRequest}
                    path={pathForRequest}
                    cluster={cluster}
                    buttonText={textForRequest}
                />
            </div>
        );
    }

    renderRequestPermissionIsNotAllowed(objectType) {
        return (
            <Info className={block('error-block')}>
                It is not possible to request access to the{' '}
                {hammer.format['Readable'](objectType, {caps: 'none'})}. Please request access to
                the parent directory.
            </Info>
        );
    }

    render() {
        const {loaded, hasError} = this.props;

        return (
            <ErrorBoundary>
                <div className="navigation elements-main-section">
                    <StickyContainer>
                        <div className={block('header')}>
                            <NavigationPermissionsNotice />

                            <div className={block('tabs')}>
                                {this.renderEditButton()}
                                {this.renderTabs()}
                            </div>
                        </div>

                        <div className={block('main')}>
                            {loaded && this.renderView()}
                            {hasError && this.renderError()}
                        </div>
                    </StickyContainer>

                    {UIFactory.yqlWidgetSetup?.renderWidget()}

                    {renderModals()}
                </div>
            </ErrorBoundary>
        );
    }
}

function mapStateToProps(state) {
    const isFinalState = isNavigationFinalLoadState(state);
    const loadState = getLoadState(state);
    const hasError = loadState === LOADING_STATUS.ERROR;
    const loaded = loadState === LOADING_STATUS.LOADED;
    return {
        path: getPath(state),
        mode: getEffectiveMode(state),
        type: getType(state),
        isIdmSupported: getIdmSupport(state),
        supportedTabs: getSupportedTabs(state),
        attributes: getAttributes(state),
        error: getError(state),
        hasError,
        loaded,
        loading: !isFinalState,
        parsedPath: getParsedPath(state),
        transaction: getTransaction(state),
        cluster: getCluster(state),
        tabSize: getUISizes().tabSize,
        tabletErrorsCount: getTabletErrorsCount(state),
    };
}

const mapDispatchToProps = {
    setMode,
    updateView,
    updateTitle,
    onTransactionChange,
    showNavigationAttributesEditor,
};

const NavigationConnected = connect(mapStateToProps, mapDispatchToProps)(Navigation);

const NavigationWithRumMemo = React.memo(NavigationWithMesure);

function NavigationWithMesure() {
    const path = useSelector(getPath);
    const transaction = useSelector(getTransaction);
    const isFinalState = useSelector(isNavigationFinalLoadState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_PRELOAD,
        startDeps: [isFinalState, path, transaction],
        allowStart: ([isFinal]) => {
            return !isFinal;
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_PRELOAD,
        stopDeps: [isFinalState],
        allowStop: ([isFinal]) => {
            return isFinal;
        },
    });

    return <NavigationConnected />;
}

export default function NavigationWithRum() {
    return <NavigationWithRumMemo />;
}
