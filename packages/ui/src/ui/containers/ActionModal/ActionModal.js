import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import Modal from '../../components/Modal/Modal';
import Error from '../../components/Error/Error';
import Radiobox from '../../components/Radiobox/Radiobox';
import SimpleModal from '../../components/Modal/SimpleModal';
import TimeInput from '../../components/TimeInput/TimeInput';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import {dismissAction, confirmAction} from '../../store/actions/actions';
import {MODAL_STATES} from '../../constants/actions';
import {Checkbox} from '@gravity-ui/uikit';

const block = cn('elements-confirmation');

class ActionModal extends React.Component {
    static propTypes = {
        dismissAction: PropTypes.func,
        confirmAction: PropTypes.func,
        status: PropTypes.oneOf(_.values(MODAL_STATES)),
        handler: PropTypes.func,
        message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        details: PropTypes.string,
        errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        errorValue: PropTypes.string,
        optionMessage: PropTypes.string,
        optionValue: PropTypes.string,
        optionType: PropTypes.oneOf(['radio', 'input', 'time']),
        confirmationText: PropTypes.string,
        options: PropTypes.arrayOf(
            PropTypes.shape({
                text: PropTypes.string,
                value: PropTypes.string,
            }),
        ),
        error: PropTypes.object,
        modalKey: PropTypes.string,
        confirmed: PropTypes.bool,
    };

    state = {
        currentOption: undefined,
        modalKey: undefined,
        confirmed: false,
        validity: false,
    };

    static getDerivedStateFromProps(props, state) {
        if (props.modalKey !== state.modalKey) {
            return {
                currentOption: props.optionValue,
                modalKey: props.modalKey,
                validity: props.optionType === 'time' ? isNaN(props.currentOption) : true,
            };
        }

        return null;
    }

    dismissAction = () => {
        const {dismissAction} = this.props;
        this.setState({confirmed: false});
        dismissAction();
    };

    confirmAction = () => {
        const {handler, confirmAction} = this.props;
        const {currentOption} = this.state;

        return confirmAction(handler, {currentOption}).then(
            () => {
                this.setState({confirmed: false});
            },
            () => {
                this.setState({confirmed: false});
            },
        );
    };

    handleInputChange = (value) => {
        if (isNaN(value)) {
            this.setState({validity: false});
        } else {
            this.setState({currentOption: value, validity: true});
        }
    };

    renderRadioOptions() {
        const {options} = this.props;
        const {currentOption} = this.state;

        return (
            <Radiobox
                size="m"
                layout="vertical"
                value={currentOption}
                items={options}
                onChange={(event) => this.setState({currentOption: event.target.value})}
            />
        );
    }

    renderInputOptions() {
        const {currentOption} = this.state;

        return (
            <TimeInput
                size="m"
                theme="normal"
                view="default"
                tone="default"
                value={currentOption}
                onChange={this.handleInputChange}
            />
        );
    }

    renderOptions() {
        const {optionMessage, optionType} = this.props;

        return (
            <div className={block('option')}>
                <p className={block('option-message')}>{optionMessage}</p>
                <div className={block('option-control')}>
                    {optionType === 'radio' && this.renderRadioOptions()}
                    {optionType === 'input' && this.renderInputOptions()}
                </div>
            </div>
        );
    }

    render() {
        const {message, details, options, status, errorMessage, error, confirmationText} =
            this.props;
        const {confirmed, validity} = this.state;

        if (status === MODAL_STATES.HIDDEN) {
            return null;
        }

        if (status === MODAL_STATES.FAILED) {
            return (
                <SimpleModal
                    visible
                    title="Failure"
                    onCancel={this.dismissAction}
                    onOutsideClick={this.dismissAction}
                >
                    <p>{errorMessage}</p>
                    <Error error={error} />
                </SimpleModal>
            );
        }

        const isConfirmDisabled = !validity || (confirmationText && !confirmed);

        return (
            [MODAL_STATES.PROMPT, MODAL_STATES.PENDING].indexOf(status) > -1 && (
                <Modal
                    isConfirmDisabled={() => isConfirmDisabled}
                    visible
                    title="Confirmation"
                    confirmText="Confirm"
                    onCancel={this.dismissAction}
                    onOutsideClick={this.dismissAction}
                    loading={status === MODAL_STATES.PENDING}
                    onConfirm={this.confirmAction}
                    content={
                        <ErrorBoundary>
                            <div className={block('text', 'elements-section')}>
                                <p>{message}</p>
                                <p className="elements-secondary-text">{details}</p>
                            </div>

                            {options?.length > 0 && this.renderOptions()}

                            {confirmationText && (
                                <Checkbox
                                    checked={confirmed}
                                    onChange={(e) =>
                                        this.setState({
                                            confirmed: e.target.checked,
                                        })
                                    }
                                >
                                    {confirmationText}
                                </Checkbox>
                            )}
                        </ErrorBoundary>
                    }
                />
            )
        );
    }
}

const mapStateToProps = ({actions}) => actions;

const mapDispatchToProps = {
    dismissAction,
    confirmAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionModal);
