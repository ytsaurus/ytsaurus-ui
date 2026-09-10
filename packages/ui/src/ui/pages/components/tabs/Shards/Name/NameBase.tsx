import React, {Fragment, useState} from 'react';
import PropTypes from 'prop-types';

import {TextInput} from '@gravity-ui/uikit';
import Button from '../../../../../components/Button/Button';
import Modal from '../../../../../components/Modal/Modal';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {type FIX_MY_TYPE} from '../../../../../types';
import Icon from '../../../../../components/Icon/Icon';
import i18n from '../i18n';

NameBase.propTypes = {
    // from parent
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,

    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    visible: PropTypes.bool.isRequired,
    editId: PropTypes.string.isRequired,

    setShardName: PropTypes.func.isRequired,
    openNameEditor: PropTypes.func.isRequired,
    closeNameEditor: PropTypes.func.isRequired,
};

type OwnProps = {
    id: string;
    name: string;
    className: string;
};

type StateProps = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: FIX_MY_TYPE;
    visible: boolean;
    editId: string;
};

type DispatchProps = {
    setShardName: (id: string, name: string) => void;
    openNameEditor: (id: string) => void;
    closeNameEditor: () => void;
};

type NameProps = OwnProps & StateProps & DispatchProps;

export function NameBase({
    name: initialName,
    id,
    editId,
    className,
    visible,
    openNameEditor,
    closeNameEditor,
    setShardName,
    loading,
    error,
    errorData,
}: NameProps) {
    const [name, changeName] = useState(initialName);
    const handleConfirm = () => setShardName(id, name);
    const handleOpen = () => openNameEditor(id);
    const isConfirmDisabled = () => name === initialName;

    return (
        <div className={className}>
            {initialName}
            <Button
                size="m"
                view="flat-secondary"
                onClick={handleOpen}
                title={i18n('action_edit-name')}
            >
                <Icon awesome="pencil" />
            </Button>

            {visible && id === editId && (
                <Modal
                    isConfirmDisabled={isConfirmDisabled}
                    onConfirm={handleConfirm}
                    onCancel={closeNameEditor}
                    loading={loading}
                    visible={visible}
                    title={i18n('action_edit-name')}
                    content={
                        <Fragment>
                            <TextInput
                                size="m"
                                value={name}
                                onUpdate={changeName}
                                placeholder={i18n('context_enter-name')}
                            />
                            {error && <YTErrorBlock error={errorData} />}
                        </Fragment>
                    }
                />
            )}
        </div>
    );
}
