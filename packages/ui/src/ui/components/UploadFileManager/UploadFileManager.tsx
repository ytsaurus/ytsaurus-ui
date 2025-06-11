import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Toaster} from '@gravity-ui/uikit';
import {AxiosError, AxiosProgressEvent, isCancel} from 'axios';

import Link from '../Link/Link';
import Modal from '../Modal/Modal';
import hammer from '../../common/hammer';
import CancelHelper from '../../utils/cancel-helper';
import {getPath} from '../../store/selectors/navigation';
import withVisible, {WithVisibleProps} from '../../hocs/withVisible';
import {getCluster} from '../../store/selectors/global';
import FileDropZone from '../FileDropZone/FileDropZone';
import FileUploadProgress from '../FileUploadProgress/FileUploadProgress';

import {uploadFile} from './uploadFile';
import useFileValidation from './useFileValidation';
import {updateView} from '../../store/actions/navigation';
import {UploadFileManagerFileFormValues} from './UploadFileManagerTypes';
import UploadFileManagerFileSettingsForm from './UploadFileManagerFileSettingsForm';

interface UploadFileManagerProps extends WithVisibleProps {
    title: string;
}

type UseUploadFileManagerProps = {
    onSuccess(params: {filePath: string}): void;
};

export const useUploadFileManager = (opts: UseUploadFileManagerProps) => {
    const dispatch = useDispatch();
    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);

    const [file, setFile] = React.useState<File>();
    const [isProgress, setProgress] = React.useState(false);
    const [progressEvent, setProgressEvent] = React.useState<AxiosProgressEvent>();

    const cancelHelperRef = React.useRef(new CancelHelper());
    const cancelHelper = cancelHelperRef.current;

    const {validateName, nameAlreadyUsed} = useFileValidation();

    const formId = React.useMemo(() => `upload-form-${Math.random()}`, []);

    const onFile = (files: FileList | null) => {
        const uploadedFile = files?.[0];

        if (uploadedFile && !isProgress) {
            setFile(uploadedFile);
        }
    };

    const handleSubmit = (values: UploadFileManagerFileFormValues) => {
        if (file) {
            setProgress(true);

            const filePath = `${values.path}/${values.name}`;

            return uploadFile({
                file,
                cluster,
                filePath,
                cancelHelper,
                handleUploadProgress: (progressEvent: AxiosProgressEvent) =>
                    setProgressEvent(progressEvent),
            })
                .finally(() => setProgress(false))
                .then(() => {
                    dispatch(updateView());
                    opts.onSuccess({
                        filePath,
                    });
                })
                .catch((error: AxiosError) => {
                    if (isCancel(error)) {
                        return;
                    }

                    throw error;
                });
        }
    };

    const initialValues = React.useMemo(() => {
        if (file) {
            return {
                path,
                name: file?.name,
                size: `${hammer.format['Bytes'](file.size)} / ${hammer.format['Number'](
                    file.size,
                )} B`,
            };
        }

        return {};
    }, [path, file]);

    const onValidation = React.useCallback(
        (values: UploadFileManagerFileFormValues) => {
            if (!values.name) {
                return {name: 'File name is required'};
            }

            if (validateName(values.name)) {
                return {name: 'A file with this name already exists'};
            }

            return undefined;
        },
        [validateName],
    );

    const cancelUpload = () => {
        cancelHelper.removeAllRequests();
        setProgress(false);
        setProgressEvent(undefined);
    };

    const onReset = () => {
        setFile(undefined);
    };

    React.useEffect(() => {
        return () => {
            cancelHelper.removeAllRequests();
        };
    }, [cancelHelper]);

    return {
        onReset,
        cancelUpload,
        isProgress,
        file,
        onFile,
        formId,
        handleSubmit,
        initialValues,
        progressEvent,
        onValidation,
        nameAlreadyUsed,
    };
};

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
                onClick={props.handleClose}
            >
                Close
            </Button>
        );
    };

    return (
        <React.Fragment>
            <Modal
                size="m"
                title={props.title}
                visible={props.visible}
                onCancel={() => {}}
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
