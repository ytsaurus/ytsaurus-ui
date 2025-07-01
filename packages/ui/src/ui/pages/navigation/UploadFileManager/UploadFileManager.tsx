import * as React from 'react';
import cn from 'bem-cn-lite';

import {Button, Toaster} from '@gravity-ui/uikit';

import Link from '../../../components/Link/Link';
import Modal from '../../../components/Modal/Modal';
import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';
import FileDropZone from '../../../components/FileDropZone/FileDropZone';
import FileUploadProgress from '../../../components/FileUploadProgress/FileUploadProgress';

import UploadFileManagerFileSettingsForm from './UploadFileManagerFileSettingsForm';
import {useUploadFileManager} from '../../../containers/UploadFileManager';

import './UploadFileManager.scss';

const block = cn('yt-upload-file-manager');

interface UploadFileManagerProps extends WithVisibleProps {
    title: string;
}

export const UploadFileManager: React.FC<UploadFileManagerProps> = (props) => {
    const uploadSettings = useUploadFileManager({
        onSuccess: ({filePath}) => {
            props.handleClose();

            const toaster = new Toaster();

            toaster.add({
                name: 'upload_file_manager',
                title: 'Upload complete',
                content: <Link url={`${location.pathname}?path=${filePath}`}>{filePath}</Link>,
                theme: 'success',
                autoHiding: 10000,
            });
        },
    });
    const isUploadButtonDisabled = uploadSettings.isProgress || !uploadSettings.file;

    const handleClose = () => {
        props.handleClose();
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
                title="Upload"
                type="submit"
            >
                Upload
            </Button>
        );
    };

    const renderFooterContent = () => {
        return uploadSettings.isProgress ? (
            <Button onClick={uploadSettings.cancelUpload}>Cancel upload</Button>
        ) : (
            <Button type="reset" onClick={uploadSettings.onReset}>
                Reset
            </Button>
        );
    };

    const renderClose = () => {
        return (
            <Button
                size="m"
                title="Close"
                disabled={uploadSettings.isProgress}
                onClick={handleClose}
            >
                Close
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
                confirmText="Upload"
                content={renderContent()}
                footerContent={uploadSettings.file ? renderFooterContent() : null}
                renderCustomConfirm={renderConfirm}
                renderCustomCancel={renderClose}
                contentClassName={''}
            />
        </React.Fragment>
    );
};

export const UploadFileManagerWithClose = withVisible(UploadFileManager);

export default UploadFileManager;
