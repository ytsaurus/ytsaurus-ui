import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import Error from '../../../../components/Error/Error';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../components/Link/Link';

import withVisible from '../../../../hocs/withVisible';

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
                    title={'Copy ' + version}
                />
            </div>
        );
    }

    renderErrorVersion() {
        const {handleShow, error, handleClose, visible} = this.props;

        return (
            <div className="elements-monospace elements-ellipsis">
                <Icon awesome="exclamation-triangle" /> Error &emsp;
                <Link theme="ghost" onClick={handleShow}>
                    View
                </Link>
                <SimpleModal visible={visible} onCancel={handleClose} onOutsideClick={handleClose}>
                    <Error error={error} />
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
