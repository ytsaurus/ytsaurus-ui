import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import hammer from '../../../common/hammer';
import {getMastersHostType} from '../../../store/selectors/settings';
import ypath from '../../../common/thor/ypath';
import Icon from '../../../components/Icon/Icon';
import {SwitchLeaderButton} from './SwitchLeader';
import {Instance} from './Instance';

import map_ from 'lodash/map';
import './MasterGroup.scss';

const b = block('master-group');

class MasterGroup extends Component {
    static propTypes = {
        // from parent
        className: PropTypes.string,
        instances: PropTypes.arrayOf(
            PropTypes.shape({
                state: PropTypes.string,
                $address: PropTypes.string,
                $physicalAddress: PropTypes.string,
            }),
        ),
        cellTag: PropTypes.number,
        quorum: PropTypes.shape({
            status: PropTypes.string,
            leaderCommitedVersion: PropTypes.string,
        }),
        leader: PropTypes.shape({
            state: PropTypes.string,
            $address: PropTypes.string,
        }),
        // from connect
        hostType: PropTypes.oneOf(['host', 'physicalHost']),
        gridRowStart: PropTypes.bool,
        allowVoting: PropTypes.bool,
        allowService: PropTypes.bool,
    };

    renderQuorum() {
        const {quorum, cellTag, cellId, instances} = this.props;
        const status = quorum ? quorum.status : 'unknown';
        const quorumTitle = quorum && `Leader committed version: ${quorum.leaderCommitedVersion}`;
        const cellTitle = `Cell tag: ${cellTag}`;
        const icons = {
            quorum: 'check-circle',
            'weak-quorum': 'exclamation-circle',
            'no-quorum': 'exclamation-circle',
            unknown: 'question-circle',
        };
        const states = {
            quorum: 'present',
            'weak-quorum': 'weak',
            'no-quorum': 'missing',
            unknown: 'unknown',
        };
        let leadingHost = '';
        const hosts = instances.map(({$address, state}) => {
            if (state === 'leading') {
                leadingHost = $address;
            }

            return $address;
        });

        return (
            <Fragment>
                {quorum && (
                    <Fragment>
                        <div
                            className={b('quorum-status', {
                                state: states[status],
                            })}
                        >
                            <Icon face="solid" awesome={icons[status]} />
                        </div>
                        <div className={b('quorum-label')}>
                            {hammer.format['Readable'](status, {
                                delimiter: '-',
                            })}
                        </div>

                        <div className={b('icon')} title={quorumTitle}>
                            <Icon className={b('icon-glyph')} face="" awesome="code-branch" />
                        </div>
                    </Fragment>
                )}

                <div className={b('host', {quorum: true})}>
                    <div className={b('quorum-version')} title={quorumTitle}>
                        <span>{quorum && quorum.leaderCommitedVersion}</span>
                    </div>
                    <div className={b('quorum-cell')} title={cellTitle}>
                        {cellTag && <Icon className={b('icon-glyph')} face="solid" awesome="tag" />}
                        {hammer.format['Hex'](cellTag)}
                        {cellId && (
                            <SwitchLeaderButton
                                cellId={cellId}
                                hosts={hosts}
                                leadingHost={leadingHost}
                            />
                        )}
                    </div>
                </div>
            </Fragment>
        );
    }

    render() {
        const {className, instances, hostType, gridRowStart, allowVoting, allowService} =
            this.props;

        return (
            <div className={b('group', {'grid-row-start': gridRowStart}, className)}>
                {this.renderQuorum()}
                {map_(
                    instances,
                    ({state, $address, $physicalAddress, $attributes, $rowAddress}) => {
                        const address = hostType === 'host' ? $address : $physicalAddress;
                        const maintenance = ypath.getValue($rowAddress, '/attributes/maintenance');
                        const maintenanceMessage = maintenance
                            ? ypath.getValue($rowAddress, '/attributes/maintenance_message') ||
                              'Maintenance'
                            : '';
                        return (
                            <Instance
                                key={$address}
                                address={address}
                                state={state}
                                attributes={$attributes}
                                maintenanceMessage={maintenanceMessage}
                                maintenance={maintenance}
                                allowVoting={allowVoting}
                                allowService={allowService}
                            />
                        );
                    },
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const hostType = getMastersHostType(state);
    return {hostType};
};

export default connect(mapStateToProps)(MasterGroup);
