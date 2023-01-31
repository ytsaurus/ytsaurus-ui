import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../../../../../components/Modal/Modal';
import Label from '../../../../../components/Label/Label';

import withDisableAction from '../../../../../hocs/pages/components/nodes/withDisableAction';

function DisableModal({label, host, title, confirmText, visible, loading, onCancel, onApply}) {
    const handleConfirm = () => onApply(host);

    const content = <Label type="text" text={label} theme="danger" />;

    return (
        visible && (
            <Modal
                size="m"
                title={title}
                content={content}
                visible={visible}
                loading={loading}
                onCancel={onCancel}
                confirmText={confirmText}
                onOutsideClick={onCancel}
                onConfirm={handleConfirm}
            />
        )
    );
}

DisableModal.propTypes = {
    // from hoc
    host: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
};

export default withDisableAction(DisableModal);
