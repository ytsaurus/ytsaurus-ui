import React, {Component} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';

import './NodesTypes.scss';
import {
    getNodesInfo,
    getSelectedNodes,
} from '../../../../../store/selectors/navigation/content/map-node';
import MultipleActions from '../MultipleActions';

const b = block('nodes-types');
const DISPLAYED_NODES = 3;

class NodesTypes extends Component {
    static propTypes = {
        nodes: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                count: PropTypes.number.isRequired,
            }),
        ).isRequired,
        selectedNodes: PropTypes.array.isRequired,
    };

    _prepareNodes(nodes) {
        const sortedNodes = _.orderBy(nodes, (node) => node.count, 'desc');

        return _.slice(sortedNodes, 0, DISPLAYED_NODES);
    }

    _getSumCount(nodes) {
        return _.reduce(nodes, (sum, node) => sum + node.count, 0);
    }

    renderItem(node) {
        return (
            <li className={b('item')} key={node.type}>
                <span className={b('type')}>{node.type}</span>
                <span className={b('count')}>{node.count}</span>
            </li>
        );
    }

    renderItems(nodes) {
        return _.map(nodes, (node) => this.renderItem(node));
    }

    renderSelected() {
        const {selectedNodes} = this.props;
        if (!selectedNodes.length) {
            return null;
        }
        return (
            <li className={b('item')}>
                <span className={b('type')}>Selected</span>
                <span className={b('count')}>{selectedNodes.length}</span>
                <MultipleActions className={b('actions')} />
            </li>
        );
    }

    render() {
        const {nodes} = this.props;

        const displayedNodes = this._prepareNodes(nodes);
        const allNodesCount = this._getSumCount(nodes);
        const displayedNodesCount = this._getSumCount(displayedNodes);
        const otherNodesCount = allNodesCount - displayedNodesCount;

        return (
            <ul className={b('list')}>
                {this.renderItem({type: 'All', count: allNodesCount})}
                {this.renderItems(displayedNodes)}
                {otherNodesCount > 0 && this.renderItem({type: 'Other', count: otherNodesCount})}
                {this.renderSelected()}
            </ul>
        );
    }
}

function NodesInfo() {
    const nodesInfo = useSelector(getNodesInfo);
    const selectedNodes = useSelector(getSelectedNodes);

    return <NodesTypes nodes={nodesInfo} selectedNodes={selectedNodes} />;
}

export default React.memo(NodesInfo);
