import * as React from 'react';
import {DFDialogProps, YTDFDialog, makeFormSubmitError} from '../../../components/Dialog';

export type UploadFileManagerFileFormValues = {
    name?: string;
    path?: string;
    size?: string;
};

interface FileSettingsFormProps {
    className?: string;
    initialValues: UploadFileManagerFileFormValues;
    formId: string;
    isDisabled: boolean;
    onSubmit: (values: UploadFileManagerFileFormValues) => Promise<void>;
    onValidation: DFDialogProps['validate'];
}

export const UploadFileManagerFileSettingsForm: React.FC<FileSettingsFormProps> = ({
    onSubmit,
    formId,
    isDisabled,
    onValidation,
    initialValues,
    className,
}) => {
    return (
        <YTDFDialog<UploadFileManagerFileFormValues>
            className={className}
            onAdd={(formApi) => {
                const values = formApi.getState().values;

                return onSubmit(values).catch(makeFormSubmitError);
            }}
            onClose={() => {}}
            validate={onValidation}
            visible={true}
            modal={false}
            formId={formId}
            initialValues={initialValues}
            footerProps={{
                hidden: true,
            }}
            fields={[
                {
                    name: 'path',
                    caption: 'Parent folder',
                    type: 'plain',
                },
                {
                    name: 'name',
                    caption: 'Name',
                    type: 'text',
                    required: true,
                    extras: {
                        disabled: isDisabled,
                    },
                },
                {
                    name: 'size',
                    caption: 'Size',
                    type: 'plain',
                },
            ]}
        />
    );
};

export default UploadFileManagerFileSettingsForm;
