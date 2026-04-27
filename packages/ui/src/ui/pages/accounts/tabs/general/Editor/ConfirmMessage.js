import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Message from '../../../../../components/Message/Message';
import i18n from './i18n';

export default class ConfirmMessage extends Component {
    static propTypes = {
        text: PropTypes.object.isRequired,
        confirmQuestion: PropTypes.string,
        onApply: PropTypes.func,
        onCancel: PropTypes.func,
    };

    static defaultProps = {
        get confirmQuestion() {
            return i18n('confirm_apply-changes');
        },
    };

    render() {
        const {text, confirmQuestion, onApply, onCancel} = this.props;

        return (
            <Message
                theme="info"
                content={[text, confirmQuestion]}
                buttons={[
                    ...(onApply
                        ? [
                              {
                                  text: i18n('action_yes'),
                                  callback: onApply,
                              },
                          ]
                        : []),
                    ...(onCancel
                        ? [
                              {
                                  text: i18n('action_cancel'),
                                  callback: onCancel,
                              },
                          ]
                        : []),
                ]}
            />
        );
    }
}
