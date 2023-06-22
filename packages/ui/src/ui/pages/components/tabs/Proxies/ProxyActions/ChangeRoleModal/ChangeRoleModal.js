import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import Label from '../../../../../../components/Label/Label';
import Modal from '../../../../../../components/Modal/Modal';
import {TextInput} from '@gravity-ui/uikit';

import {
    changeRole,
    closeChangeRoleModal,
} from '../../../../../../store/actions/components/proxies/actions/change-role';
import {PROXY_TYPE} from '../../../../../../constants/components/proxies/proxies';

import './ChangeRoleModal.scss';

const block = cn('components-change-role-modal');

function ChangeRoleModal({host, visible, loading, closeChangeRoleModal, changeRole, type}) {
    const [role, setRole] = useState('');

    const handleConfirm = () => changeRole(host, role, type);

    const content = (
        <div className={block()}>
            <Label
                type="text"
                theme="danger"
                className={block('label')}
                text={`You are about to change role for proxy ${host}`}
            />

            <TextInput size="l" value={role} onUpdate={setRole} placeholder="Enter new role..." />
        </div>
    );

    return (
        visible && (
            <Modal
                visible
                size="m"
                title="Change role"
                content={content}
                loading={loading}
                confirmText="Change"
                onConfirm={handleConfirm}
                onCancel={closeChangeRoleModal}
                onOutsideClick={closeChangeRoleModal}
            />
        )
    );
}

ChangeRoleModal.propTypes = {
    // from parent
    type: PropTypes.oneOf([PROXY_TYPE.HTTP, PROXY_TYPE.RPC]).isRequired,

    // from connect
    host: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,

    closeChangeRoleModal: PropTypes.func.isRequired,
    changeRole: PropTypes.func.isRequired,
};

const mapStateToProps = ({components}) => {
    const {host, visible, loading} = components.proxies.changeRole;

    return {host, visible, loading};
};

const mapDispatchToProps = {
    closeChangeRoleModal,
    changeRole,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangeRoleModal);
