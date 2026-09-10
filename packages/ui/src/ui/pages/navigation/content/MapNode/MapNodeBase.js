import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import CreateTableModal from '../../modals/CreateTableModal/CreateTableModal';

import MapNodesTable from './MapNodesTable/MapNodesTable';

import {LOADING_STATUS} from '../../../../constants/index';
import {MapNodeToolbar} from './MapNodeToolbar/MapNodeToolbar';

const block = cn('map-node');
const tbBlock = cn('elements-toolbar');

export class MapNodeBase extends Component {
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
