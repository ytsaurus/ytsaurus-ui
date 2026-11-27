import React, {Component} from 'react';
import {connect} from 'react-redux';
import {type RootState} from '../../store/reducers';
import {type AttributesModalTitle} from '../../store/reducers/modals/attributes-modal';
import cn from 'bem-cn-lite';
import unipika from '../../common/thor/unipika';

import FormattedText from '../../components/formatters/FormattedText';
import SimpleModal from '../../components/Modal/SimpleModal';
import {YTErrorBlock} from '../../containers/Block/Block';
import {Yson, type YsonSettings} from '../../components/Yson/Yson';

import {closeAttributesModal} from '../../store/actions/modals/attributes-modal';
import {DownloadFileButton} from '../../components/DownloadAttributesButton';
import {attributesToString} from '../../components/DownloadAttributesButton/helpers/attributesToString';

import './AttributesModal.scss';

const block = cn('yt-attributes-modal');

interface Props {
    visible: boolean;
    loading: boolean;
    error: boolean;
    errorData: unknown;
    heading: AttributesModalTitle;
    attributes: unknown;
    ysonSettings: YsonSettings;
    closeAttributesModal: () => void;
}

export class AttributesModal extends Component<Props> {
    handleClose = () => this.props.closeAttributesModal();

    renderContent() {
        const {attributes, ysonSettings, errorData, error} = this.props;

        if (error) {
            return <YTErrorBlock error={errorData} />;
        }

        return <Yson className={block('content')} value={attributes} settings={ysonSettings} />;
    }

    renderDownloadButton() {
        const {title, titleToDecode} = this.props.heading;
        const convertedValue = attributesToString(this.props.attributes, this.props.ysonSettings);
        if (!convertedValue) {
            return null;
        }

        return (
            <DownloadFileButton
                content={convertedValue}
                name={`${title ?? titleToDecode}.txt`}
                type="application/txt"
            />
        );
    }

    override render() {
        const {visible, heading, loading} = this.props;
        const {title, titleToDecode} = heading;

        return (
            visible && (
                <SimpleModal
                    title={title ?? <FormattedText text={titleToDecode} />}
                    footerContent={this.renderDownloadButton()}
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

const mapStateToProps = ({modals}: RootState) => {
    const {visible, loading, error, errorData, heading, attributes} = modals.attributesModal;
    const ysonSettings = unipika.prepareSettings();

    return {
        visible,
        loading,
        error,
        errorData,
        heading,
        attributes,
        ysonSettings,
    };
};

const mapDispatchToProps = {
    closeAttributesModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(AttributesModal);
