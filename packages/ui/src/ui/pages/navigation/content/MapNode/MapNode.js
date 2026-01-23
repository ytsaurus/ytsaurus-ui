import {DropdownMenu} from '@gravity-ui/uikit';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {getConfigUploadTable} from '../../../../config/index';

import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import RadioButton from '../../../../components/RadioButton/RadioButton';
import Button from '../../../../components/Button/Button';
import Filter from '../../../../components/Filter/Filter';
import {SelectSingle} from '../../../../components/Select/Select';
import {YTErrorBlock} from '../../../../components/Error/Error';
import Icon from '../../../../components/Icon/Icon';
import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import TTLInfo from '../../../../components/TTLInfo/TTLInfo';
import CreateTableModal from '../../modals/CreateTableModal/CreateTableModal';
import {isCreateTableModalVisible} from '../../../../store/selectors/navigation/modals/create-table';

import MapNodesTable from './MapNodesTable';

import {openCreateTableModal} from '../../../../store/actions/navigation/modals/create-table';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {getNavigationPathAttributes} from '../../../../store/selectors/navigation/navigation';
import {getMediumList} from '../../../../store/selectors/thor';
import {
    getContentMode,
    getError,
    getFilterState,
    getLoadState,
    getMapNodeResourcesLoading,
    getMediumType,
    isRootNode,
} from '../../../../store/selectors/navigation/content/map-node';

import {OPEN_CREATE_DIRECTORY_POPUP} from '../../../../constants/navigation/modals/create-directory';
import {LOADING_STATUS} from '../../../../constants/index';
import {ContentMode} from '../../../../constants/navigation';

import {openEditingPopup} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {
    fetchNodes,
    setContentMode,
    setFilter,
    setMediumType,
    updateResourceUsage,
} from '../../../../store/actions/navigation/content/map-node';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';

import hammer from '../../../../common/hammer';
import UploadManagerCreate from '../Table/UploadManager/UploadManagerCreate';
import NodesTypes from './NodesTypes/NodesTypes';

import {NoWrap} from '../../../../components/Text/Text';
import {showLinkToModal} from '../../../../store/actions/navigation/modals/link-to-modal';
import {openCreateACOModal} from '../../../../store/actions/navigation/modals/create-aco';
import NavigationExtraActions from '../../../../containers/NavigationExtraActions/NavigationExtraActions';
import UIFactory from '../../../../UIFactory';
import {getCluster} from '../../../../store/selectors/global';
import {UploadFileManagerWithClose} from '../../UploadFileManager';

import './MapNode.scss';
import {MapNodeUserSettings} from './MapNodeUserSettings';

const block = cn('map-node');
const tbBlock = cn('elements-toolbar');

class MapNode extends Component {
    static TYPE = 'map_node';

    static CONTENT_MODE_OPTIONS = [ContentMode.DEFAULT, ContentMode.RESOURCES];

    static propTypes = {
        error: PropTypes.object,
        loadState: PropTypes.string,
        contentMode: PropTypes.oneOf(MapNode.CONTENT_MODE_OPTIONS),
        path: PropTypes.string.isRequired,
        transaction: PropTypes.string,
        mediumList: PropTypes.arrayOf(PropTypes.string),
        mediumType: PropTypes.string.isRequired,
        filterState: PropTypes.string.isRequired,

        setFilter: PropTypes.func.isRequired,
        setContentMode: PropTypes.func.isRequired,
        fetchNodes: PropTypes.func.isRequired,
        setMediumType: PropTypes.func.isRequired,
        openEditingPopup: PropTypes.func.isRequired,
        openCreateTableModal: PropTypes.func.isRequired,
        openCreateACOModal: PropTypes.func.isRequired,
        showACOCreateButton: PropTypes.bool.isRequired,
        cluster: PropTypes.bool.isRequired,
    };

    componentDidMount() {
        this.props.fetchNodes();
    }

    componentDidUpdate(prevProps) {
        const {path, transaction, fetchNodes} = this.props;
        const {path: prevPath, transaction: prevTransaction} = prevProps;
        if (path !== prevPath || transaction !== prevTransaction) {
            fetchNodes();
        }
    }

    renderError() {
        const {
            error: {message, details},
        } = this.props;
        return (
            <div className={block('error')}>
                <YTErrorBlock message={message} error={details} />
            </div>
        );
    }

    renderView() {
        return (
            <StickyContainer>
                {({stickyTopClassName}) => (
                    <React.Fragment>
                        <div className={tbBlock({sticky: false}, stickyTopClassName)}>
                            <MapNodeToolbarConnected />
                        </div>
                        <div className={block('content')}>
                            <MapNodesTable />
                        </div>
                    </React.Fragment>
                )}
            </StickyContainer>
        );
    }

    render() {
        const {loadState} = this.props;

        return (
            <ErrorBoundary>
                <div className={block()}>
                    {loadState === LOADING_STATUS.ERROR ? this.renderError() : this.renderView()}
                </div>
                <CreateTableModal />
            </ErrorBoundary>
        );
    }
}

function mapStateToProps(state) {
    const path = getPath(state);

    return {
        path,
        showACOCreateButton: path === '//sys/access_control_object_namespaces/queries',
        loadState: getLoadState(state),
        error: getError(state),
        contentMode: getContentMode(state),
        filterState: getFilterState(state),
        transaction: getTransaction(state),
        mediumList: getMediumList(state),
        mediumType: getMediumType(state),
        showCreateTableModal: isCreateTableModalVisible(state),
        attributes: getNavigationPathAttributes(state),
        cluster: getCluster(state),
    };
}

const mapDispatchToProps = {
    setFilter,
    setContentMode,
    fetchNodes,
    setMediumType,
    openEditingPopup,
    openCreateTableModal,
    showLinkToModal,
    openCreateACOModal,
};

const MapNodeConnected = connect(mapStateToProps, mapDispatchToProps)(MapNode);

export default function MapNodeWithRum() {
    const loadState = useSelector(getLoadState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_MAP_NODE,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return loadState === LOADING_STATUS.LOADING;
        },
    });
    return <MapNodeConnected />;
}

class MapNodeToolbar extends React.PureComponent {
    uploadXlsRef = React.createRef();
    uploadFileRef = React.createRef();

    createDirectoryButtonClick = () => {
        const {path, openEditingPopup} = this.props;
        openEditingPopup(null, path + '/', OPEN_CREATE_DIRECTORY_POPUP);
    };

    createTableButtonClick = () => {
        const {path} = this.props;
        this.props.openCreateTableModal(path);
    };

    uploadTableButtonClick = () => {
        if (this.uploadXlsRef.current) {
            this.uploadXlsRef.current.handleShow();
        }
    };

    uploadFileButtonClick = () => {
        if (this.uploadFileRef.current) {
            this.uploadFileRef.current.handleShow();
        }
    };

    createLinkButtonClick = () => {
        const {path} = this.props;
        this.props.showLinkToModal({path: `${path}/new_link`});
    };

    createACOButtonClick = () => {
        const {path} = this.props;

        this.props.openCreateACOModal({path, namespace: 'queries'});
    };

    render() {
        const {
            setFilter,
            contentMode,
            setContentMode,
            mediumList,
            mediumType,
            setMediumType,
            filterState,
            path,
            attributes,
            showACOCreateButton,
            cluster,
        } = this.props;

        const {uploadTableExcelBaseUrl} = getConfigUploadTable({cluster});

        const {menuItems, renderModals} = UIFactory.getMapNodeExtraCreateActions([
            {
                action: this.createTableButtonClick,
                text: <NoWrap>Table</NoWrap>,
                iconStart: <Icon awesome={'table'} face={'solid'} />,
            },
            {
                action: this.createDirectoryButtonClick,
                text: <NoWrap>Directory</NoWrap>,
                iconStart: <Icon awesome={'folder'} face={'solid'} />,
            },
            {
                action: this.createLinkButtonClick,
                text: <NoWrap>Link</NoWrap>,
                iconStart: <Icon awesome={'link'} />,
            },
            showACOCreateButton && {
                action: this.createACOButtonClick,
                text: <NoWrap>ACO</NoWrap>,
                iconStart: <Icon awesome={'acl-object'} />,
            },
            ...(!uploadTableExcelBaseUrl
                ? []
                : [
                      {
                          action: this.uploadTableButtonClick,
                          text: <NoWrap>Upload xlsx</NoWrap>,
                          iconStart: <Icon awesome={'upload'} />,
                      },
                  ]),
            {
                action: this.uploadFileButtonClick,
                text: <NoWrap>Upload file</NoWrap>,
                iconStart: <Icon awesome={'upload'} />,
            },
        ]);

        return (
            <div className={block('toolbar')}>
                <div className={tbBlock('container')}>
                    <div className={block('filter', tbBlock('component'))}>
                        <Filter
                            size="m"
                            key={path}
                            debounce={300}
                            value={filterState}
                            onChange={setFilter}
                            qa="map-node-filter"
                        />
                    </div>

                    <TTLInfo attributes={attributes} size={'m'} className={tbBlock('component')} />

                    <div className={tbBlock('component')}>
                        <MapNodeUserSettings />
                    </div>

                    <div className={block('content-mode', tbBlock('component'))}>
                        <RadioButton
                            size="m"
                            name="navigation-map-node-content-mode"
                            value={contentMode}
                            items={map_(
                                MapNode.CONTENT_MODE_OPTIONS,
                                RadioButton.prepareSimpleValue,
                            )}
                            onChange={(event) => setContentMode(event.target.value)}
                        />
                    </div>

                    <div className={block('show-resources', tbBlock('component'))}>
                        <ShowResourcesButton />
                    </div>

                    {mediumList?.length && (
                        <div className={block('medium-type', tbBlock('component'))}>
                            <SelectSingle
                                label="Medium:"
                                placeholder="All"
                                value={mediumType}
                                items={map_(mediumList, (type) => ({
                                    value: type,
                                    text: hammer.format['ReadableField'](type),
                                }))}
                                onChange={setMediumType}
                                width="max"
                                hideFilter={true}
                            />
                        </div>
                    )}

                    <NavigationExtraActions
                        className={block('copy-to-remote', tbBlock('component'))}
                    />

                    <div className={block('create-object', tbBlock('component'))}>
                        <DropdownMenu
                            menuSize={'n'}
                            popupClass={block('create-popup')}
                            items={menuItems}
                            renderSwitcher={(props) => (
                                <Button {...props} size="m" title="Create object">
                                    Create object
                                </Button>
                            )}
                        />
                    </div>
                </div>
                <div className="nodes-types">
                    <NodesTypes />
                </div>
                <UploadManagerCreate ref={this.uploadXlsRef} />
                <UploadFileManagerWithClose ref={this.uploadFileRef} title={'Upload file'} />
                {renderModals()}
            </div>
        );
    }
}

function ShowResourcesButton() {
    const dispatch = useDispatch();
    const isRoot = useSelector(isRootNode);
    const loading = useSelector(getMapNodeResourcesLoading);
    return (
        <Button
            size="m"
            title="Show all nodes resource usage [Shift+S]"
            disabled={isRoot}
            loading={loading}
            onClick={() => dispatch(updateResourceUsage())}
            hotkey={[{keys: 'shift+s', handler: updateResourceUsage, scope: 'all'}]}
        >
            Show resources
        </Button>
    );
}

const MapNodeToolbarConnected = connect(mapStateToProps, mapDispatchToProps)(MapNodeToolbar);
