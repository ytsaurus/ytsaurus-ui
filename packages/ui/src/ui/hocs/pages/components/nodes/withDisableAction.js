import React from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import {connect} from 'react-redux';

import {getDisplayName} from '../../../../utils';
import {
    JOBS,
    TABLET_CELLS,
    WRITE_SESSION,
} from '../../../../constants/components/nodes/actions/disable-enable';
import {
    closeDisableModal,
    disableJobs,
    disableTabletCells,
    disableWriteSession,
    enableJobs,
    enableTabletCells,
    enableWriteSession,
} from '../../../../store/actions/components/nodes/actions/disable-enable';

export default function withDisableAction(Component) {
    const ResComponent = class WithDisableAction extends React.Component {
        static propTypes = {
            // from connect
            host: PropTypes.string.isRequired,
            visible: PropTypes.bool.isRequired,
            type: PropTypes.oneOf(['enable', 'disable']).isRequired,
            subject: PropTypes.oneOf([WRITE_SESSION, TABLET_CELLS, JOBS]).isRequired,

            disablingWriteSession: PropTypes.bool.isRequired,
            enablingWriteSession: PropTypes.bool.isRequired,
            disablingTabletCells: PropTypes.bool.isRequired,
            enablingTabletCells: PropTypes.bool.isRequired,
            disablingJobs: PropTypes.bool.isRequired,
            enablingJobs: PropTypes.bool.isRequired,

            closeDisableModal: PropTypes.func.isRequired,

            enableWriteSession: PropTypes.func.isRequired,
            disableWriteSession: PropTypes.func.isRequired,

            disableTabletCells: PropTypes.func.isRequired,
            enableTabletCells: PropTypes.func.isRequired,

            disableJobs: PropTypes.func.isRequired,
            enableJobs: PropTypes.func.isRequired,
        };

        static displayName = `WithDisableAction(${getDisplayName(Component)})`;

        get label() {
            const {host, type, subject} = this.props;

            return `You are about to ${type} ${subject} for node ${host}`;
        }

        get loading() {
            const {
                disablingWriteSession,
                enablingWriteSession,
                disablingTabletCells,
                enablingTabletCells,
                disablingJobs,
                enablingJobs,
            } = this.props;

            return {
                [WRITE_SESSION]: {
                    disable: disablingWriteSession,
                    enable: enablingWriteSession,
                },
                [TABLET_CELLS]: {
                    disable: disablingTabletCells,
                    enable: enablingTabletCells,
                },
                [JOBS]: {
                    disable: disablingJobs,
                    enable: enablingJobs,
                },
            };
        }

        get handleApply() {
            const {
                host,
                disableWriteSession,
                enableWriteSession,
                disableTabletCells,
                enableTabletCells,
                disableJobs,
                enableJobs,
            } = this.props;

            return {
                [WRITE_SESSION]: {
                    disable: () => disableWriteSession(host),
                    enable: () => enableWriteSession(host),
                },
                [TABLET_CELLS]: {
                    disable: () => disableTabletCells(host),
                    enable: () => enableTabletCells(host),
                },
                [JOBS]: {
                    disable: () => disableJobs(host),
                    enable: () => enableJobs(host),
                },
            };
        }

        get title() {
            const {type, subject} = this.props;

            return `${hammer.format['FirstUppercase'](type)} ${subject}`;
        }

        render() {
            const {closeDisableModal, host, visible, subject, type, ...rest} = this.props;

            return (
                <Component
                    {...rest}
                    host={host}
                    visible={visible}
                    label={this.label}
                    title={this.title}
                    onCancel={closeDisableModal}
                    loading={this.loading[subject][type]}
                    onApply={this.handleApply[subject][type]}
                    confirmText={hammer.format['FirstUppercase'](type)}
                />
            );
        }
    };

    const mapStateToProps = ({components}) => ({
        ...components.nodes.disableEnable,
    });
    const mapDispatchToProps = {
        closeDisableModal,
        enableWriteSession,
        disableWriteSession,
        disableTabletCells,
        enableTabletCells,
        disableJobs,
        enableJobs,
    };

    return connect(mapStateToProps, mapDispatchToProps)(ResComponent);
}
