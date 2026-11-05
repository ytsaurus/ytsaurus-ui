import React from 'react';
import cn from 'bem-cn-lite';

import {type ConnectedProps} from 'react-redux';
import {type ActionModalData, type ActionModalState} from '../../store/reducers/actions';
import {type connector} from './ActionModal';

import Modal from '../../components/Modal/Modal';
import {YTErrorBlock} from '../../containers/Block/Block';
import Radiobox from '../../components/Radiobox/Radiobox';
import SimpleModal from '../../components/Modal/SimpleModal';
import TimeInput from '../../components/TimeInput/TimeInput';
import ErrorBoundary from '../../containers/ErrorBoundary/ErrorBoundary';
import {MODAL_STATES} from '../../constants/actions';
import {Checkbox} from '@gravity-ui/uikit';
import i18n from './i18n';

const block = cn('elements-confirmation');

type Props = ConnectedProps<typeof connector>;

interface State extends ActionModalData {
    modalKey: ActionModalState['modalKey'];
    confirmed: boolean;
    validity: boolean;
}

export class ActionModalBase extends React.Component<Props, State> {
    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.modalKey !== state.modalKey) {
            return {
                currentOption: props.optionValue,
                modalKey: props.modalKey,
                validity: true,
            };
        }

        return null;
    }

    override state: State = {
        currentOption: undefined,
        modalKey: undefined,
        confirmed: false,
        validity: false,
    };

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

    handleInputChange = (value: number) => {
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
                value={typeof currentOption === 'string' ? currentOption : undefined}
                items={options ?? []}
                onChange={(event) => this.setState({currentOption: event.target.value})}
            />
        );
    }

    renderInputOptions() {
        const {currentOption} = this.state;

        return (
            <TimeInput size="m" value={Number(currentOption)} onChange={this.handleInputChange} />
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

    override render() {
        const {message, details, options, status, errorMessage, error, confirmationText} =
            this.props;
        const {confirmed, validity} = this.state;

        if (status === MODAL_STATES.HIDDEN) {
            return null;
        }

        if (status === MODAL_STATES.FAILED) {
            return (
                <SimpleModal visible title={i18n('title_failure')} onCancel={this.dismissAction}>
                    <p>{errorMessage}</p>
                    <YTErrorBlock error={error} />
                </SimpleModal>
            );
        }

        const isConfirmDisabled = !validity || (Boolean(confirmationText) && !confirmed);

        return (
            (status === MODAL_STATES.PROMPT || status === MODAL_STATES.PENDING) && (
                <Modal
                    isConfirmDisabled={() => isConfirmDisabled}
                    visible
                    title={i18n('title_confirmation')}
                    confirmText={i18n('button_confirm')}
                    onCancel={this.dismissAction}
                    loading={status === MODAL_STATES.PENDING}
                    onConfirm={this.confirmAction}
                    content={
                        <ErrorBoundary>
                            <div className={block('text', 'elements-section')}>
                                <p>{message}</p>
                                <p className="elements-secondary-text">{details}</p>
                            </div>

                            {Boolean(options?.length) && this.renderOptions()}

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
