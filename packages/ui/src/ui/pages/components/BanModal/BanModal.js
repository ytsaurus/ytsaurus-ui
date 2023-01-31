import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import Modal from '../../../components/Modal/Modal';
import Label from '../../../components/Label/Label';
import {TextInput} from '@gravity-ui/uikit';

import {closeBanModal} from '../../../store/actions/components/ban-unban';

import './BanModal.scss';

const block = cn('components-ban-modal');

function BanModal({visible, banning, host, label, closeBanModal, ban}) {
    const [message, setMessage] = useState('');

    const content = (
        <div className={block()}>
            <Label
                type="text"
                theme="danger"
                className={block('label')}
                text={`${label} ${host}`}
            />

            <TextInput
                size="l"
                value={message}
                onUpdate={setMessage}
                placeholder="Enter ban message..."
            />
        </div>
    );

    return (
        visible && (
            <Modal
                size="m"
                title={host}
                confirmText="Ban"
                loading={banning}
                content={content}
                visible={visible}
                onCancel={closeBanModal}
                onOutsideClick={closeBanModal}
                onConfirm={() => ban({host, message})}
            />
        )
    );
}

BanModal.propTypes = {
    // from parent
    label: PropTypes.string.isRequired,

    ban: PropTypes.func.isRequired,

    // from connect
    visible: PropTypes.bool.isRequired,
    banning: PropTypes.bool.isRequired,
    host: PropTypes.string.isRequired,

    closeBanModal: PropTypes.func.isRequired,
};

const mapStateToProps = ({components}) => {
    const {banVisible, banning, host} = components.banUnban;

    return {
        visible: banVisible,
        banning,
        host,
    };
};

export default connect(mapStateToProps, {closeBanModal})(BanModal);
