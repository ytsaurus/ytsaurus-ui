import React, {FC, useRef, useState} from 'react';
import {Dialog} from '@gravity-ui/uikit';
import {
    EditJsonProps,
    EditJsonWithPreview,
} from '../../../../components/EditJsonWithPreview/EditJsonWithPreview';
import cn from 'bem-cn-lite';
import './DocumentEditModal.scss';

type Props = {
    open: boolean;
    saving: boolean;
    document: any;
    onCancel: () => void;
    onSave: (data: string) => void;
};

const block = cn('document-edit-modal');

const DocumentEditModal: FC<Props> = ({open, document, onCancel, saving, onSave}) => {
    const [error, setError] = useState(false);
    const result = useRef<string>(JSON.stringify(document, null, '\t'));

    const handleChange = (data: EditJsonProps['value']) => {
        result.current = data.value || '';
        setError(Boolean(data.error));
    };

    const handleSaveDocument = () => {
        onSave(result.current);
    };

    return (
        <Dialog onClose={onCancel} open={open} modalClassName={block()}>
            <Dialog.Header caption="Edit document" />

            <Dialog.Body>
                <EditJsonWithPreview
                    value={{value: result.current}}
                    onChange={handleChange}
                    className={block('editor')}
                    initialSplitSize={500}
                    initialShowPreview={false}
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onCancel}
                onClickButtonApply={handleSaveDocument}
                textButtonCancel="Cancel"
                textButtonApply="Save"
                showError={false}
                preset="success"
                loading={saving}
                listenKeyEnter={false}
                propsButtonApply={{disabled: error}}
            />
        </Dialog>
    );
};

export default DocumentEditModal;
