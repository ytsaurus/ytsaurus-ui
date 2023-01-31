import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {flagToChar, Node, Flag} from '../../../constants/index';

export const rackPropTypes = {
    empty: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            $value: PropTypes.string.isRequired,
            $attributes: PropTypes.shape({
                alerts: PropTypes.bool.isRequired,
                banned: PropTypes.bool.isRequired,
                full: PropTypes.bool,
                decommissioned: PropTypes.bool.isRequired,
                effectiveFlag: PropTypes.string.isRequired,
                effectiveState: PropTypes.string.isRequired,
                state: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    ).isRequired,
};

export default class NodeRackGroup extends Component {
    static propTypes = {
        // from parent component
        size: PropTypes.shape({
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
        }).isRequired,
        rack: PropTypes.shape(rackPropTypes).isRequired,
        horizontal: PropTypes.bool,
    };

    static defaultProps = {
        horizontal: false,
    };

    componentDidMount() {
        this.initializeCanvas();
    }

    componentDidUpdate() {
        this.initializeCanvas();
    }

    _root = getComputedStyle(document.body);

    _getColor(color) {
        return this._root.getPropertyValue(color);
    }

    stateToColor = {
        online: this._getColor('--success-color'),
        offline: this._getColor('--danger-color'),
        banned: this._getColor('--warning-color'),
        unknown: this._getColor('--info-color'),
        mixed: this._getColor('--default-color'),
        registered: this._getColor('--default-color'),
        unregistered: this._getColor('--default-color'),
    };

    drawNode(ctx, node, coords) {
        const state = node.$attributes.effectiveState;
        const flag = node.$attributes.effectiveFlag;

        ctx.fillStyle = this.stateToColor[state] || this.stateToColor['unknown'];
        ctx.fillRect(coords.x, coords.y, Node.SIZE, Node.SIZE);

        if (flag) {
            ctx.fillStyle = this._getColor('--light-text');
            ctx.textBaseline = 'top';
            ctx.fillText(flagToChar[flag], coords.x + Flag.OFFSET_X, coords.y - Flag.OFFSET_Y);
        }
    }

    calcHeight() {
        const {height} = this.props.size;

        const count = this.getRowsCount();

        const res = Math.min(height, count * Node.SIDE);
        return res;
    }

    getRowsCount() {
        const {
            rack,
            horizontal,
            size: {width},
        } = this.props;

        const allNodes = rack.nodes.length;
        const rows = horizontal
            ? Math.ceil((allNodes * Node.SIDE) / width)
            : Math.ceil(allNodes / Node.COUNT_IN_ROW);
        return rows;
    }

    drawNodes(ctx) {
        const {
            rack,
            horizontal,
            size: {width},
        } = this.props;

        const allNodes = rack.nodes.length;
        const countInRow = horizontal ? Math.floor(width / Node.SIDE) : Node.COUNT_IN_ROW;
        const rows = this.getRowsCount();
        const nodesInLastRow = countInRow - (rows * countInRow - allNodes);

        let nodeCount = 0;
        const startX = Node.OFFSET;
        const startY = Node.OFFSET;

        for (let i = 0; i < rows; i++) {
            const nodesInCurrentRow = i === rows - 1 ? nodesInLastRow : countInRow;

            for (let j = 0; j < nodesInCurrentRow; j++) {
                const currentNode = rack.nodes[nodeCount++];
                const coordX = startX + j * (Node.SIZE + Node.OFFSET * 2);
                const coordY = startY + i * (Node.SIZE + Node.OFFSET * 2);

                this.drawNode(ctx, currentNode, {x: coordX, y: coordY});
            }
        }
    }

    initializeCanvas() {
        const {width} = this.props.size;
        const ctx = this.canvas.getContext('2d');
        let scale = 2;

        if (window.devicePixelRatio > 2) {
            scale = window.devicePixelRatio;
        }

        const h = this.calcHeight();
        this.canvas.width = width * scale;
        this.canvas.height = h * scale;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = h + 'px';

        ctx.scale(scale, scale);

        this.drawNodes(ctx);
    }

    render() {
        return (
            <canvas
                ref={(canvas) => {
                    this.canvas = canvas;
                }}
            />
        );
    }
}
