import React, {Component} from 'react';
import {type ConnectedProps, connect} from 'react-redux';
import {type RootState} from '../../store/reducers';
import cn from 'bem-cn-lite';
import unipika from '../../common/thor/unipika';

import FormattedText from '../../components/formatters/FormattedText';
import SimpleModal from '../../components/Modal/SimpleModal';
import {YTErrorBlock} from '../../containers/Block/Block';
import {Yson} from '../../components/Yson/Yson';

import {closeAttributesModal} from '../../store/actions/modals/attributes-modal';
import {DownloadFileButton} from '../../components/DownloadAttributesButton';
import {attributesToString} from '../../components/DownloadAttributesButton/helpers/attributesToString';

import './AttributesModal.scss';

const block = cn('yt-attributes-modal');

type Props = ConnectedProps<typeof connector>;

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
        const convertedValue = attributesToString(this.props.attributes, this.props.ysonSettings);
        if (!convertedValue) {
            return null;
        }

        return (
            <DownloadFileButton
                content={convertedValue}
                name={`${this.props.title}.txt`}
                type="application/txt"
            />
        );
    }

    override render() {
        const {visible, title, loading} = this.props;

        return (
            visible && (
                <SimpleModal
                    title={<FormattedText text={title} />}
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
    const {visible, loading, error, errorData, title, attributes} = modals.attributesModal;
    const ysonSettings = unipika.prepareSettings();

    return {
        visible,
        loading,
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

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(AttributesModal);
