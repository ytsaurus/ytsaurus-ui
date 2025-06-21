import * as React from 'react';
import {DFDialogProps, YTDFDialog, makeFormSubmitError} from '../../../components/Dialog';
import {UploadFileManagerFileFormValues} from './UploadFileManagerTypes';

interface FileSettingsFormProps {
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
}) => {
    return (
        <YTDFDialog<UploadFileManagerFileFormValues>
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
