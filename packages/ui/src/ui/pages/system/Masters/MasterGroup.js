import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';
import {getMastersHostType} from '../../../store/selectors/settings';
import Icon from '../../../components/Icon/Icon';
import {Secondary} from '../../../components/Text/Text';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import MetaTable from '../../../components/MetaTable/MetaTable';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';

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

        const hexCellTag = format.Hex(cellTag);

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
                            {format.Readable(status, {
                                delimiter: '-',
                            })}
                        </div>

                        <div className={b('icon')} title={quorumTitle}>
                            <Icon className={b('icon-glyph')} face="" awesome="code-branch" />
                        </div>
                    </Fragment>
                )}

                {Boolean(quorum?.leaderCommitedVersion) || cellTag !== undefined ? (
                    <div className={b('host', {quorum: true})}>
                        <div className={b('quorum-version')} title={quorumTitle}>
                            <span>{quorum && quorum.leaderCommitedVersion}</span>
                        </div>
                        <Flex alignItems="center">
                            <Tooltip
                                className={b('quorum-cell')}
                                placement={['top', 'bottom']}
                                content={
                                    <MetaTable
                                        items={[
                                            {
                                                key: 'Hexadecimal cell tag',
                                                value: (
                                                    <>
                                                        {hexCellTag}{' '}
                                                        <ClipboardButton
                                                            view="clear"
                                                            size="xs"
                                                            text={hexCellTag}
                                                        >
                                                            {hexCellTag}
                                                        </ClipboardButton>
                                                    </>
                                                ),
                                            },
                                            {
                                                key: 'Decimal cell tag',
                                                value: (
                                                    <>
                                                        {cellTag}{' '}
                                                        <ClipboardButton
                                                            view="clear"
                                                            theme=""
                                                            size="xs"
                                                            text={cellTag}
                                                        >
                                                            {cellTag}
                                                        </ClipboardButton>
                                                    </>
                                                ),
                                            },
                                        ]}
                                    />
                                }
                            >
                                {cellTag && (
                                    <Icon className={b('icon-glyph')} face="solid" awesome="tag" />
                                )}
                                {hexCellTag}
                                <Secondary> / </Secondary>
                                {cellTag}
                            </Tooltip>
                            <SwitchLeaderButton cellId={cellId} hosts={instances} />
                        </Flex>
                    </div>
                ) : null}
            </Fragment>
        );
    }

    render() {
        const {className, instances, hostType, gridRowStart, allowVoting, allowService} =
            this.props;

        return (
            <div className={b('group', {'grid-row-start': gridRowStart}, className)}>
                {this.renderQuorum()}
                {map_(instances, (instance) => {
                    return (
                        <Instance
                            instance={instance}
                            key={instance.$address}
                            hostType={hostType}
                            allowVoting={allowVoting}
                            allowService={allowService}
                        />
                    );
                })}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const hostType = getMastersHostType(state);
    return {hostType};
};

export default connect(mapStateToProps)(MasterGroup);
