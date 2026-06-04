import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {ClipboardButton} from '@ytsaurus/components';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../containers/Link/Link';

import withVisible from '../../../../hocs/withVisible';
import i18n from './i18n';

const block = cn('elements-column');

class Version extends Component {
    static propTypes = {
        // from parent component
        version: PropTypes.string.isRequired,
        error: PropTypes.object,

        // from hoc
        visible: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        handleShow: PropTypes.func.isRequired,
    };

    renderVersion() {
        const {version} = this.props;

        return (
            <div className={block({type: 'id', 'with-hover-button': true})} title={version}>
                <span className="elements-monospace elements-ellipsis">{version}</span>
                &nbsp;
                <ClipboardButton
                    text={version}
                    view="flat-secondary"
                    size="s"
                    title={i18n('action_copy', {version})}
                />
            </div>
        );
    }

    renderErrorVersion() {
        const {handleShow, error, handleClose, visible} = this.props;

        return (
            <div className="elements-monospace elements-ellipsis">
                <Icon awesome="exclamation-triangle" /> {i18n('alert_error')} &emsp;
                <Link theme="ghost" onClick={handleShow}>
                    {i18n('action_view')}
                </Link>
                <SimpleModal visible={visible} onCancel={handleClose}>
                    <YTErrorBlock error={error} />
                </SimpleModal>
            </div>
        );
    }

    render() {
        const {error} = this.props;

        return error ? this.renderErrorVersion() : this.renderVersion();
    }
}

export default withVisible(Version);
