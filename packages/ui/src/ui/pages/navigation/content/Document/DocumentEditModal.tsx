import React, {FC, useCallback} from 'react';
import cn from 'bem-cn-lite';
import './DocumentEditModal.scss';
import {FormApi, YTDFDialog} from '../../../../components/Dialog/Dialog';
import {Text} from '@gravity-ui/uikit';
import {UnipikaSettings} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';

type Props = {
    open: boolean;
    document: any;
    settings: UnipikaSettings;
    onCancel: () => void;
    onSave: (data: string) => Promise<void>;
};

type FormValues = {
    jsonEditor: {value: string};
};

const block = cn('document-edit-modal');

const DocumentEditModal: FC<Props> = ({open, document, settings, onCancel, onSave}) => {
    const handleSaveDocument = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            return onSave(form.getState().values.jsonEditor.value);
        },
        [onSave],
    );

    return (
        <YTDFDialog<FormValues>
            className={block()}
            headerProps={{
                title: (
                    <Text variant="header-1" color="secondary">
                        Edit document
                    </Text>
                ),
            }}
            visible={open}
            onClose={onCancel}
            onAdd={handleSaveDocument}
            initialValues={{jsonEditor: {value: JSON.stringify(document, null, '\t')}}}
            fields={[
                {
                    fullWidth: true,
                    name: 'jsonEditor',
                    type: 'json',
                    extras: {
                        className: block('editor'),
                        initialSplitSize: '50%',
                        initialShowPreview: false,
                        unipikaSettings: settings,
                        folding: true,
                    },
                },
            ]}
        />
    );
};

export default DocumentEditModal;
