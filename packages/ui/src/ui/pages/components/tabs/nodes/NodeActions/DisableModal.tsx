import React from 'react';
import {ConnectedProps, connect} from 'react-redux';

import Modal from '../../../../../components/Modal/Modal';
import Label from '../../../../../components/Label/Label';

import hammer from '../../../../../common/hammer';

import {
    JOBS,
    TABLET_CELLS,
    WRITE_SESSION,
} from '../../../../../constants/components/nodes/actions/disable-enable';
import {
    closeDisableModal,
    disableJobs,
    disableTabletCells,
    disableWriteSession,
    enableJobs,
    enableTabletCells,
    enableWriteSession,
} from '../../../../../store/actions/components/nodes/actions/disable-enable';
import {RootState} from '../../../../../store/reducers';

type ReduxProps = ConnectedProps<typeof connector>;

class DisableModal extends React.Component<ReduxProps> {
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

    isLoading() {
        const {subject, type} = this.props;
        return (this.loading as any)[subject][type];
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

    handleConfirm = () => {
        const {type, subject} = this.props;
        (this.handleApply as any)[subject]?.[type]?.();
    };

    get title() {
        const {type, subject} = this.props;

        return `${hammer.format['FirstUppercase'](type)} ${subject}`;
    }

    render() {
        const {closeDisableModal: onClose, visible, type} = this.props;

        const content = <Label type="text" text={this.label} theme="danger" />;

        return (
            visible && (
                <Modal
                    size="m"
                    title={this.title}
                    content={content}
                    visible={visible}
                    loading={this.isLoading()}
                    onCancel={onClose}
                    confirmText={hammer.format['FirstUppercase'](type)}
                    onOutsideClick={onClose}
                    onConfirm={this.handleConfirm}
                />
            )
        );
    }
}

const mapStateToProps = ({components}: RootState) => ({
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

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(DisableModal);
