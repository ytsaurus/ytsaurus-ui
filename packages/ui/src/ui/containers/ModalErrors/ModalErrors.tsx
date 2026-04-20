import {DialogWrapper as Dialog} from '../../components/DialogWrapper/DialogWrapper';
import React from 'react';
import {type ConnectedProps, connect} from 'react-redux';

import {hideErrorModal} from '../../store/actions/modals/errors';
import {getModalErrors} from '../../store/selectors/modals/errors';
import {YTAlertBlock} from '../../components/Alert/Alert';
import {YTErrorBlock} from '../../components/Error/Error';
import {type RootState} from '../../store/reducers';
import {type ErrorInfo} from '../../store/reducers/modals/errors';
import i18n from './i18n';

interface MEProps {
    id: number | string;
    data: ErrorInfo;
    hide: (id: MEProps['id']) => void;
    children?: React.ReactNode;
}

export function ModalError({id, data, hide, children}: MEProps) {
    const close = React.useCallback(() => {
        hide(id);
    }, [id, hide]);

    const {error, hideOopsMsg, type, helpURL, disableLogger, defaultExpandedCount} = data;

    const isAlert = type === 'alert';
    const ErrorComponent = isAlert ? YTAlertBlock : YTErrorBlock;

    return (
        <Dialog open={true} onClose={close}>
            <Dialog.Header caption={isAlert ? i18n('title_alert') : i18n('title_error')} />
            <Dialog.Divider />
            <Dialog.Body>
                <ErrorComponent
                    type={isAlert ? 'alert' : 'error'}
                    message={!hideOopsMsg && i18n('alert_something-went-wrong')}
                    error={error}
                    helpURL={helpURL}
                    disableLogger={disableLogger}
                    defaultExpandedCount={defaultExpandedCount}
                />
                {children}
            </Dialog.Body>
        </Dialog>
    );
}

type Props = ConnectedProps<typeof connector>;

class ModalErrors extends React.Component<Props> {
    hideError = (errorId: number | string) => {
        this.props.hideError(errorId);
    };

    render() {
        const {errors} = this.props;
        return errors.map(({id, error}) => {
            return <ModalError key={id} id={id} data={error} hide={this.hideError} />;
        });
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        errors: getModalErrors(state),
    };
};

const mapDispatchToProps = {
    hideError: hideErrorModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ModalErrors);
