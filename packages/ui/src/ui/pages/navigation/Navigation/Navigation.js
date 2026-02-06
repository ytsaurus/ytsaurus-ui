import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../store/redux-hooks';
import PropTypes from 'prop-types';
import hammer from '../../../common/hammer';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {getCluster} from '../../../store/selectors/global';
import {updateTitle} from '../../../store/actions/global';

import {
    CopyObjectModal,
    CreateDirectoryModal,
    DeleteObjectModal,
    MoveObjectModal,
    RestoreObjectModal,
} from './PathEditorModal';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import ContentViewer from './ContentViewer/ContentViewer';
import {checkContentIsSupported} from './ContentViewer/helpers';
import Tabs from '../../../components/Tabs/Tabs';
import {NavigationError} from './NavigationError';

import {Tab} from '../../../constants/navigation';
import {LOADING_STATUS} from '../../../constants/index';

import {onTransactionChange, setMode, updateView} from '../../../store/actions/navigation';

import {
    getError,
    getIdmSupport,
    getLoadState,
    getParsedPath,
    getPath,
    getTransaction,
    getType,
    isNavigationFinalLoadState,
} from '../../../store/selectors/navigation';
import {getEffectiveMode, getTabs} from '../../../store/selectors/navigation/navigation';
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
import {UI_TAB_SIZE} from '../../../constants/global';
import {CellPreviewModal} from '../../../containers/CellPreviewModal/CellPreviewModal';
import {OpenQueryButtonsContent} from '../../../containers/OpenQueryButtons/OpenQueryButtons';
import {UpdateAccessLogAvailability} from '../../../pages/navigation/tabs/AccessLog/UpdateAccessLogAvailability/UpdateAccessLogAvailability';

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
            <CellPreviewModal />
            <OpenQueryButtonsContent />
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
        const {tabs, setMode} = this.props;

        return tabs.map((tab) => {
            if (tab.hotkey) {
                return {
                    ...tab,
                    hotkey: tab.hotkey.map(({keys, tab, scope}) => {
                        return {
                            keys,
                            scope,
                            handler: () => setMode(tab),
                        };
                    }),
                };
            }

            return tab;
        });
    }

    onTabChange = (value) => {
        const {setMode} = this.props;
        if (value !== Tab.ORIGINATING_QUEUE) {
            setMode(value);
        }
    };

    renderTabs() {
        const {mode, tabSize} = this.props;
        const items = map_(this.items, (item) => ({
            ...item,
            text: item.text || hammer.format['ReadableField'](item.value),
            show: true,
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
                <Button
                    size="m"
                    className={block('edit-metadata-btn')}
                    title={'Edit metadata'}
                    onClick={this.onEditButtonClick}
                >
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
        if (checkContentIsSupported(type, mode)) {
            return <ContentViewer type={type} mode={mode} />;
        }

        return this.renderPlaceholder();
    }

    renderError() {
        const {
            error: {message, details},
            cluster,
            path,
        } = this.props;

        return (
            <NavigationError cluster={cluster} path={path} details={details} message={message} />
        );
    }

    render() {
        const {loaded, hasError} = this.props;

        return (
            <ErrorBoundary>
                <UpdateAccessLogAvailability />
                <div className={block({error: hasError}, 'elements-main-section')}>
                    <div className={block('header')}>
                        <NavigationPermissionsNotice />

                        <div className={block('tabs')}>
                            {this.renderEditButton()}
                            {this.renderTabs()}
                        </div>
                    </div>

                    <div className={block('main')}>{loaded && this.renderView()}</div>
                    {hasError && this.renderError()}

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
        error: getError(state),
        hasError,
        loaded,
        loading: !isFinalState,
        parsedPath: getParsedPath(state),
        transaction: getTransaction(state),
        cluster: getCluster(state),
        tabSize: UI_TAB_SIZE,
        tabs: getTabs(state),
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
