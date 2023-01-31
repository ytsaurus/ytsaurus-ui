import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Message from '../../../../../components/Message/Message';

export default class ConfirmMessage extends Component {
    static propTypes = {
        text: PropTypes.object.isRequired,
        confirmQuestion: PropTypes.string,
        onApply: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    static defaultProps = {
        confirmQuestion: 'Apply changes?',
    };

    render() {
        const {text, confirmQuestion, onApply, onCancel} = this.props;

        return (
            <Message
                theme="info"
                content={[text, confirmQuestion]}
                buttons={[
                    {
                        text: 'Yes',
                        callback: onApply,
                    },
                    {
                        text: 'Cancel',
                        callback: onCancel,
                    },
                ]}
            />
        );
    }
}
