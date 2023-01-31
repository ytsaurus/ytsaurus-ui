import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import {compose} from 'redux';

import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import PathEditor from '../../../../containers/PathEditor/PathEditor';
import Modal from '../../../../components/Modal/Modal';
import Error from '../../../../components/Error/Error';

import {setPath, hideError} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {getOnlyFolders} from '../../../../utils/navigation/path-editing-popup';
import withScope from '../../../../hocs/components/Modal/withScope';

import './PathEditorModal.scss';

const b = block('path-editor-modal');

class PathEditorModal extends Component {
    static propTypes = {
        // from parent component
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        modalTitle: PropTypes.string.isRequired,

        visible: PropTypes.bool.isRequired,
        showError: PropTypes.bool.isRequired,
        inProcess: PropTypes.bool.isRequired,
        errorMessage: PropTypes.string.isRequired,
        error: PropTypes.shape({
            code: PropTypes.number,
            message: PropTypes.string,
        }).isRequired,
        editingPath: PropTypes.string.isRequired,
        options: PropTypes.node,

        onConfirmButtonClick: PropTypes.func.isRequired,
        onCancelButtonClick: PropTypes.func.isRequired,

        onChange: PropTypes.func,
        onBlur: PropTypes.func,
        onApply: PropTypes.func,
        onFocus: PropTypes.func,

        // from connect
        setPath: PropTypes.func.isRequired,
        hideError: PropTypes.func.isRequired,
    };

    _handleBlur(newPath) {
        this.props.setPath(newPath);
    }
    _handleFocus(newPath) {
        this.props.setPath(newPath);
    }
    _handleApply(newPath) {
        this.props.setPath(newPath);
    }
    _handleChange(newPath) {
        this.props.setPath(newPath);
        this.props.hideError();
    }

    handleBlur = (newPath) => {
        const {onBlur} = this.props;

        if (typeof onBlur === 'function') {
            onBlur(newPath);
        } else {
            this._handleBlur(newPath);
        }
    };
    handleFocus = (newPath) => {
        const {onFocus} = this.props;

        if (typeof onFocus === 'function') {
            onFocus(newPath);
        } else {
            this._handleFocus(newPath);
        }
    };
    handleChange = (newPath) => {
        const {onChange} = this.props;

        if (typeof onChange === 'function') {
            onChange(newPath);
        } else {
            this._handleChange(newPath);
        }
    };
    handleApply = (newPath) => {
        const {onApply} = this.props;

        if (typeof onApply === 'function') {
            onApply(newPath);
        } else {
            this._handleApply(newPath);
        }
    };

    renderContent() {
        const {
            editingPath,
            inProcess,
            placeholder,
            title,
            description,
            showError,
            errorMessage,
            error,
            options,
        } = this.props;

        return (
            <div className={b()}>
                <strong>{title}</strong>
                <p className={b('text')}>{description}</p>

                <PathEditor
                    placeholder={placeholder}
                    customFilter={getOnlyFolders}
                    onChange={this.handleChange}
                    onApply={this.handleApply}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    defaultPath={editingPath}
                    disabled={inProcess}
                    showErrors={false}
                    autoFocus
                    hasClear
                />

                {options}

                {showError && (
                    <div className={b('error-wrapper')}>
                        <ErrorMessage message={errorMessage} />
                        <Error error={error} />
                    </div>
                )}
            </div>
        );
    }

    render() {
        const {visible, inProcess, showError, modalTitle} = this.props;

        const content = visible && this.renderContent();
        const isDisabled = () => inProcess || showError;

        return (
            <Modal
                onConfirm={this.props.onConfirmButtonClick}
                onCancel={this.props.onCancelButtonClick}
                isConfirmDisabled={isDisabled}
                confirmText="Confirm"
                loading={inProcess}
                title={modalTitle}
                content={content}
                visible={visible}
            />
        );
    }
}

export default compose(
    connect(null, {setPath, hideError}),
    withScope('path-editor-modal'),
)(PathEditorModal);
