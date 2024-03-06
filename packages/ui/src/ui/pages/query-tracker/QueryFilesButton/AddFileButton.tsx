import React, {FC, useRef, useState} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import {QueryFile} from '../module/api';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

const readFileAsync = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

type Props = {
    onLoad: (file: QueryFile) => void;
};
export const AddFileButton: FC<Props> = ({onLoad}) => {
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAddFile = () => {
        inputRef.current?.click();
    };

    const handleFileChange = async ({target}: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = target.files && target.files[0];
        if (!uploaded) return;
        setLoading(true);

        try {
            const content = await wrapApiPromiseByToaster(readFileAsync(uploaded), {
                toasterName: 'add_query_file' + uploaded.name,
                skipSuccessToast: true,
                errorTitle: 'Failed to load file',
            });
            onLoad({name: uploaded.name, content, type: 'raw_inline_data'});
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button width="auto" onClick={handleAddFile} size="l" loading={loading}>
                <Icon data={FilePlusIcon} size={16} />
                Add file
            </Button>
            <input
                ref={inputRef}
                type="file"
                style={{display: 'none'}}
                onChange={handleFileChange}
            />
        </>
    );
};
