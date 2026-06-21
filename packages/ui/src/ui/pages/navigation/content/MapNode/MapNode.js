import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';

import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import {selectIsCreateTableModalVisible} from '../../../../store/selectors/navigation/modals/create-table';
import CreateTableModal from '../../modals/CreateTableModal/CreateTableModal';

import MapNodesTable from './MapNodesTable/MapNodesTable';

import {openCreateTableModal} from '../../../../store/actions/navigation/modals/create-table';
import {selectPath, selectTransaction} from '../../../../store/selectors/navigation';
import {selectNavigationPathAttributes} from '../../../../store/selectors/navigation/navigation';
import {selectMediumList} from '../../../../store/selectors/thor';
import {
    selectContentMode,
    selectError,
    selectFilterState,
    selectLoadState,
    selectMediumType,
} from '../../../../store/selectors/navigation/content/map-node';

import {LOADING_STATUS} from '../../../../constants/index';

import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {
    fetchNodes,
    setContentMode,
    setFilter,
    setMediumType,
} from '../../../../store/actions/navigation/content/map-node';
import {openEditingPopup} from '../../../../store/actions/navigation/modals/path-editing-popup';

import {openCreateACOModal} from '../../../../store/actions/navigation/modals/create-aco';
import {showLinkToModal} from '../../../../store/actions/navigation/modals/link-to-modal';
import {selectCluster} from '../../../../store/selectors/global';

import './MapNode.scss';
import {MapNodeToolbar} from './MapNodeToolbar/MapNodeToolbar';

const block = cn('map-node');
const tbBlock = cn('elements-toolbar');

class MapNode extends Component {
    static TYPE = 'map_node';

    static propTypes = {
        error: PropTypes.object,
        loadState: PropTypes.string,
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
        cluster: PropTypes.string.isRequired,
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
                            <MapNodeToolbar />
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
    const path = selectPath(state);

    return {
        path,
        showACOCreateButton: path === '//sys/access_control_object_namespaces/queries',
        loadState: selectLoadState(state),
        error: selectError(state),
        contentMode: selectContentMode(state),
        filterState: selectFilterState(state),
        transaction: selectTransaction(state),
        mediumList: selectMediumList(state),
        mediumType: selectMediumType(state),
        showCreateTableModal: selectIsCreateTableModalVisible(state),
        attributes: selectNavigationPathAttributes(state),
        cluster: selectCluster(state),
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
    const loadState = useSelector(selectLoadState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_MAP_NODE,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return loadState === LOADING_STATUS.LOADING;
        },
    });
    return <MapNodeConnected />;
}
