import * as React from 'react';
import cn from 'bem-cn-lite';

import {Button} from '@gravity-ui/uikit';

import Link from '../../../containers/Link/Link';
import Modal from '../../../components/Modal/Modal';
import FileDropZone from '../../../components/FileDropZone/FileDropZone';
import FileUploadProgress from '../../../components/FileUploadProgress/FileUploadProgress';

import UploadFileManagerFileSettingsForm from './UploadFileManagerFileSettingsForm';
import {useUploadFileManager} from '../../../containers/UploadFileManager';

import i18n from './i18n';

import {toaster} from '../../../utils/toaster';

import './UploadFileManager.scss';

const block = cn('yt-upload-file-manager');

interface UploadFileManagerProps {
    title: string;

    visible: boolean;
    onClose: () => void;
}

export const UploadFileManager: React.FC<UploadFileManagerProps> = (props) => {
    const uploadSettings = useUploadFileManager({
        onSuccess: ({filePath}) => {
            props.onClose();

            toaster.add({
                name: 'upload_file_manager',
                title: i18n('alert_upload-complete'),
                content: <Link url={`${location.pathname}?path=${filePath}`}>{filePath}</Link>,
                theme: 'success',
                autoHiding: 10000,
            });
        },
    });
    const isUploadButtonDisabled = uploadSettings.isProgress || !uploadSettings.file;

    const handleClose = () => {
        props.onClose();
        uploadSettings.cancelUpload();
        uploadSettings.onReset();
    };

    const renderContent = () => {
        return (
            <React.Fragment>
                <FileDropZone
                    isEmpty={!uploadSettings.file}
                    onFile={uploadSettings.onFile}
                    isDropable={!uploadSettings.isProgress}
                >
                    {uploadSettings.file && (
                        <React.Fragment>
                            <UploadFileManagerFileSettingsForm
                                className={block('form')}
                                onValidation={uploadSettings.onValidation}
                                isDisabled={uploadSettings.isProgress}
                                formId={uploadSettings.formId}
                                onSubmit={uploadSettings.handleSubmit}
                                initialValues={uploadSettings.initialValues}
                            />
                            {uploadSettings.isProgress && uploadSettings.progressEvent && (
                                <FileUploadProgress event={uploadSettings.progressEvent} />
                            )}
                        </React.Fragment>
                    )}
                </FileDropZone>
            </React.Fragment>
        );
    };

    const renderConfirm = (className: string) => {
        if (uploadSettings.isProgress) {
            return null;
        }

        return (
            <Button
                view="action"
                className={className}
                disabled={isUploadButtonDisabled}
                extraProps={{
                    form: uploadSettings.formId,
                }}
                title={i18n('action_upload')}
                type="submit"
            >
                {i18n('action_upload')}
            </Button>
        );
    };

    const renderFooterContent = () => {
        return uploadSettings.isProgress ? (
            <Button onClick={uploadSettings.cancelUpload}>{i18n('action_cancel-upload')}</Button>
        ) : (
            <Button type="reset" onClick={uploadSettings.onReset}>
                {i18n('action_reset')}
            </Button>
        );
    };

    const renderClose = () => {
        return (
            <Button
                size="m"
                title={i18n('action_close')}
                disabled={uploadSettings.isProgress}
                onClick={handleClose}
            >
                {i18n('action_close')}
            </Button>
        );
    };

    return (
        <React.Fragment>
            <Modal
                className={block()}
                size="m"
                title={props.title}
                visible={props.visible}
                onCancel={handleClose}
                confirmText={i18n('action_upload')}
                content={renderContent()}
                footerContent={uploadSettings.file ? renderFooterContent() : null}
                renderCustomConfirm={renderConfirm}
                renderCustomCancel={renderClose}
                contentClassName={''}
            />
        </React.Fragment>
    );
};
