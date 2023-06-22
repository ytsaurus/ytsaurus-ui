import React, {Fragment, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {TextInput} from '@gravity-ui/uikit';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Error from '../../../../components/Error/Error';
import Icon from '../../../../components/Icon/Icon';

import {
    closeNameEditor,
    openNameEditor,
    setShardName,
} from '../../../../store/actions/components/shards';

Name.propTypes = {
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

function Name({
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
}) {
    const [name, changeName] = useState(initialName);
    const handleConfirm = () => setShardName(id, name);
    const handleOpen = () => openNameEditor(id);
    const isConfirmDisabled = () => name === initialName;

    return (
        <div className={className}>
            {initialName}
            <Button size="m" view="flat-secondary" onClick={handleOpen} title="Edit name">
                <Icon awesome="pencil" />
            </Button>

            {visible && id === editId && (
                <Modal
                    isConfirmDisabled={isConfirmDisabled}
                    onConfirm={handleConfirm}
                    onCancel={closeNameEditor}
                    loading={loading}
                    visible={visible}
                    title="Edit name"
                    content={
                        <Fragment>
                            <TextInput
                                size="m"
                                value={name}
                                onUpdate={changeName}
                                placeholder="Enter name..."
                            />
                            {error && <Error error={errorData} />}
                        </Fragment>
                    }
                />
            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    const {nameId, nameVisible, nameLoading, nameLoaded, nameError, nameErrorData} =
        state.components.shards;

    return {
        loading: nameLoading,
        loaded: nameLoaded,
        error: nameError,
        errorData: nameErrorData,
        visible: nameVisible,
        editId: nameId,
    };
};

const mapDispatchToProps = {
    setShardName,
    openNameEditor,
    closeNameEditor,
};

export default connect(mapStateToProps, mapDispatchToProps)(Name);
