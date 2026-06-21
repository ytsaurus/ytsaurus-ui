import * as React from 'react';
import {type DFDialogProps, YTDFDialog, makeFormSubmitError} from '../../../containers/Dialog';
import i18n from './i18n';

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
                    caption: i18n('field_parent-folder'),
                    type: 'plain',
                },
                {
                    name: 'name',
                    caption: i18n('field_name'),
                    type: 'text',
                    required: true,
                    extras: {
                        disabled: isDisabled,
                    },
                },
                {
                    name: 'size',
                    caption: i18n('field_size'),
                    type: 'plain',
                },
            ]}
        />
    );
};

export default UploadFileManagerFileSettingsForm;
