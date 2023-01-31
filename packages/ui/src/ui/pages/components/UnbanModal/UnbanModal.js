import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Modal from '../../../components/Modal/Modal';
import Label from '../../../components/Label/Label';

import {closeUnbanModal} from '../../../store/actions/components/ban-unban';

function UnbanModal({visible, host, unbanning, label, closeUnbanModal, unban}) {
    const content = <Label text={`${label} ${host}`} theme="danger" type="text" />;

    return (
        visible && (
            <Modal
                size="m"
                title={host}
                content={content}
                visible={visible}
                loading={unbanning}
                confirmText="Unban"
                onCancel={closeUnbanModal}
                onOutsideClick={closeUnbanModal}
                onConfirm={() => unban(host)}
            />
        )
    );
}

UnbanModal.propTypes = {
    // from parent
    label: PropTypes.string.isRequired,

    unban: PropTypes.func.isRequired,

    // from connect
    visible: PropTypes.bool.isRequired,
    unbanning: PropTypes.bool.isRequired,
    host: PropTypes.string.isRequired,

    closeUnbanModal: PropTypes.func.isRequired,
};

const mapStateToProps = ({components}) => {
    const {unbanVisible, unbanning, host} = components.banUnban;

    return {
        visible: unbanVisible,
        unbanning,
        host,
    };
};

export default connect(mapStateToProps, {closeUnbanModal})(UnbanModal);
