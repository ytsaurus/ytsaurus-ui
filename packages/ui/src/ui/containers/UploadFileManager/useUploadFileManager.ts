import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getPath} from '../../store/selectors/navigation';
import {getCluster} from '../../store/selectors/global';
import {AxiosError, AxiosProgressEvent, isCancel} from 'axios';
import CancelHelper from '../../utils/cancel-helper';
import {updateView} from '../../store/actions/navigation';
import hammer from '../../common/hammer';
import {uploadFile} from './uploadFile';
import {ytApiV3} from '../../rum/rum-wrap-api';

type UseUploadFileManagerProps = {
    onSuccess(params: {filePath: string}): void;
};

export type UseUploadFileManagerFileFormValues = {
    name?: string;
    path?: string;
    size?: string;
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

    const formId = React.useMemo(() => `upload-form-${Math.random()}`, []);

    const onFile = (files: FileList | null) => {
        const uploadedFile = files?.[0];

        if (uploadedFile && !isProgress) {
            setFile(uploadedFile);
        }
    };

    const handleSubmit = (values: UseUploadFileManagerFileFormValues) => {
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

    const onValidation = React.useCallback(async (values: UseUploadFileManagerFileFormValues) => {
        if (!values.name) {
            return {name: 'File name is required'};
        }

        if (values.path && values.name) {
            const ok = await ytApiV3.exists({
                path: `${values.path}/${values.name}`,
            });

            if (ok) {
                return {name: 'A file with this name already exists'};
            }
        }

        return undefined;
    }, []);

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
    };
};
