import React, {FC, useCallback} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import {AddFileButton} from './AddFileButton';
import './FilesAddForm.scss';
import cn from 'bem-cn-lite';
import {QueryFile} from '../../../types/query-tracker/api';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import {QueryFileAddForm} from '../../../store/reducers/queries/queryFilesFormSlice';
import {FileItemForm, FileValidator} from './FileItemForm';
import guid from '../../../common/hammer/guid';

const block = cn('files-add-form');

type Props = {
    validator: FileValidator;
    addFormOpen: QueryFileAddForm['isOpen'];
    addFormType: QueryFileAddForm['type'];
    onFormToggle: (data: QueryFileAddForm) => void;
    onAddFile: (file: QueryFile) => void;
};

export const ActionsWithAddForm: FC<Props> = ({
    validator,
    addFormOpen,
    addFormType,
    onFormToggle,
    onAddFile,
}) => {
    const handleAddLinkOrFile = useCallback(
        (file: QueryFile) => {
            onAddFile(file);
        },
        [onAddFile],
    );

    const handleLoadFile = useCallback(
        ({name, content}: QueryFile) => {
            onAddFile({name, content, type: 'raw_inline_data', id: guid()});
        },
        [onAddFile],
    );

    const handleOpenNewFileForm = useCallback(() => {
        onFormToggle({isOpen: true, type: 'raw_inline_data'});
    }, [onFormToggle]);

    const handleOpenUrlForm = useCallback(() => {
        onFormToggle({isOpen: true, type: 'url'});
    }, [onFormToggle]);

    const handelCloseForm = useCallback(() => {
        onFormToggle({isOpen: false});
    }, [onFormToggle]);

    return (
        <div className={block()}>
            {addFormOpen && (
                <FileItemForm
                    file={{
                        name: '',
                        content: '',
                        type: addFormType!,
                        id: guid(),
                    }}
                    onCancel={handelCloseForm}
                    onSave={handleAddLinkOrFile}
                    validator={validator}
                />
            )}
            <div className={block('buttons')}>
                <AddFileButton disabled={addFormOpen} onLoad={handleLoadFile} />
                <Button
                    width="auto"
                    size="l"
                    onClick={handleOpenNewFileForm}
                    disabled={addFormOpen}
                >
                    <Icon data={FilePlusIcon} size={16} />
                    New file
                </Button>
                <Button width="auto" size="l" onClick={handleOpenUrlForm} disabled={addFormOpen}>
                    <Icon data={LinkIcon} size={16} />
                    Add URL
                </Button>
            </div>
        </div>
    );
};
