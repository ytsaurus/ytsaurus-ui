import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getPath} from '../../store/selectors/navigation';
import {getCluster} from '../../store/selectors/global';
import {AxiosError, AxiosProgressEvent, isCancel} from 'axios';
import CancelHelper from '../../utils/cancel-helper';
import useFileValidation from '../../components/UploadFileManager/useFileValidation';
import {UploadFileManagerFileFormValues} from '../../components/UploadFileManager/UploadFileManagerTypes';
import {updateView} from '../../store/actions/navigation';
import hammer from '../../common/hammer';
import {uploadFile} from './uploadFile';

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
