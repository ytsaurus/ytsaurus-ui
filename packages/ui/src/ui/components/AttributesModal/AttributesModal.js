import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import unipika from '../../common/thor/unipika';

import FormattedText from '../../components/formatters/FormattedText';
import SimpleModal from '../../components/Modal/SimpleModal';
import Error from '../Error/Error';
import Yson from '../Yson/Yson';

import {closeAttributesModal} from '../../store/actions/modals/attributes-modal';

export class AttributesModal extends Component {
    static propTypes = {
        // from connect
        title: PropTypes.string.isRequired,
        visible: PropTypes.bool.isRequired,
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,
        attributes: PropTypes.object.isRequired,
        ysonSettings: Yson.settingsProps.isRequired,

        closeAttributesModal: PropTypes.func.isRequired,
    };

    handleClose = () => this.props.closeAttributesModal();

    renderContent() {
        const {attributes, ysonSettings, errorData, error} = this.props;

        return error ? (
            <Error error={errorData} />
        ) : (
            <Yson value={attributes} settings={ysonSettings} />
        );
    }

    render() {
        const {visible, title, loading} = this.props;

        return (
            visible && (
                <SimpleModal
                    title={<FormattedText text={title} />}
                    visible={visible}
                    loading={loading}
                    onCancel={this.handleClose}
                    onOutsideClick={this.handleClose}
                    size={'n'}
                >
                    {this.renderContent()}
                </SimpleModal>
            )
        );
    }
}

const mapStateToProps = ({modals}) => {
    const {visible, loading, loaded, error, errorData, title, attributes} = modals.attributesModal;
    const ysonSettings = unipika.prepareSettings();

    return {
        visible,
        loading,
        loaded,
        error,
        errorData,
        title,
        attributes,
        ysonSettings,
    };
};

const mapDispatchToProps = {
    closeAttributesModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(AttributesModal);
