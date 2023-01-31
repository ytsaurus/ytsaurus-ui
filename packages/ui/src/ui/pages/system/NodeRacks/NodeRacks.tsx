import React, {Component} from 'react';
import {connect} from 'react-redux';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import _ from 'lodash';

import NodeRacksGroup, {rackPropTypes} from '../NodeRackGroup/NodeRackGroup';

import {UNAWARE, Node} from '../../../constants/index';
import {shouldUseSafeColors} from '../../../store/selectors/settings';
import {getCluster, getTheme} from '../../../store/selectors/global';
import Link from '../../../components/Link/Link';
import {RootState} from '../../../store/reducers';

import './NodeRacks.scss';

const block = cn('system');

interface Rack {
    name: string;
    nodes: Array<unknown>;
    empty?: boolean;
}

interface Props {
    racks: Array<Rack>;
    theme: string;
    a11y: boolean;
    containerWidth: number;
    cluster: string;
    formatCounterName: (name: string) => string;
}

export class NodeRacks extends Component<Props> {
    static propTypes = {
        // from parent
        formatCounterName: PropTypes.func.isRequired,
        containerWidth: PropTypes.number,
        racks: PropTypes.arrayOf(PropTypes.shape(rackPropTypes).isRequired).isRequired,
        // from connect
        theme: PropTypes.oneOf(['light', 'dark', 'dark-hc', 'light-hc']).isRequired,
        a11y: PropTypes.bool.isRequired,
        //from hoc
        cluster: PropTypes.string.isRequired,
    };

    render() {
        const {racks} = this.props;
        const data = _.filter(racks, (rack) => !rack.empty);
        const size = this._getRackSize(data);

        return <div className={'system__racks'}>{this.renderRacks(data, size)}</div>;
    }

    _getSizeForHorizontalMode(maxNodes = 0) {
        const {containerWidth} = this.props;
        const maxNodesInRow = Math.floor(containerWidth / Node.SIDE);
        const totalRows = Math.ceil(maxNodes / maxNodesInRow);

        const width = containerWidth;
        const height = Node.SIDE * totalRows;

        return {width, height};
    }

    _getSizeForNormalMode(maxNodes = 0) {
        const totalRows = Math.ceil(maxNodes / Node.COUNT_IN_ROW);

        const width = Node.COUNT_IN_ROW * Node.SIDE;
        const height = Node.SIDE * totalRows;

        return {width, height};
    }

    _getRackSize(racks: Array<Rack>) {
        const horizontal = racks.length === 1 && racks[0].name === UNAWARE;
        const maxNodes = _.maxBy(racks, (rack) => rack.nodes.length)?.nodes.length;

        return horizontal
            ? this._getSizeForHorizontalMode(maxNodes)
            : this._getSizeForNormalMode(maxNodes);
    }

    renderRacks(racks: Array<Rack>, size: {width: number; height: number}) {
        return _.map(racks, (rack) => {
            const {formatCounterName, theme, a11y, cluster} = this.props;
            const rackUrl = `/${cluster}/components/nodes?rack=${rack.name}`;
            const rackClassName = block('rack', {size: 'm', name: rack.name});

            return (
                <Link
                    key={rack.name}
                    className={rackClassName}
                    url={rackUrl}
                    theme={'primary'}
                    routed
                >
                    <span className={'system__rack-name elements-monospace'}>{rack.name}</span>

                    <div className={block('rack-nodes')}>
                        <NodeRacksGroup
                            size={size}
                            rack={rack}
                            horizontal={rack.name === UNAWARE}
                            key={`${theme}/${a11y}`}
                        />
                    </div>

                    <div className={block('rack-counters')}>
                        <div
                            className={block('rack-counter', {
                                secondary: 'yes',
                            })}
                        >
                            {formatCounterName('total')}
                            <span>{rack.nodes.length}</span>
                        </div>
                    </div>
                </Link>
            );
        });
    }
}

const mapStateToProps = (state: RootState) => {
    const theme = getTheme(state);
    const a11y = shouldUseSafeColors(state);

    return {theme, a11y, cluster: getCluster(state)};
};

export default connect(mapStateToProps)(NodeRacks);
