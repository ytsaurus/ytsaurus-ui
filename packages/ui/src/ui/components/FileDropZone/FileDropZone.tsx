import * as React from 'react';
import cn from 'bem-cn-lite';

import FilePicker from '../FilePicker/FilePicker';
import useFileDragDrop from './useFileDragDrop';
import i18n from './i18n';

import './FileDropZone.scss';

const block = cn('file-drop-zone');

interface FileDropZoneProps {
    isEmpty: boolean;
    isDropable: boolean;
    onFile: (files: FileList | null) => void;
}

export const FileDropZone: React.FC<React.PropsWithChildren<FileDropZoneProps>> = ({
    isDropable,
    onFile,
    isEmpty,
    children,
}) => {
    const {onDrop, onDragOver, onDragEnter, onDragLeave, isDragging} = useFileDragDrop(onFile);

    const renderContent = () => {
        if (children) {
            return children;
        }

        return (
            <div className={block('info')}>
                <div>{isDragging ? i18n('context_drop-file') : i18n('context_drag-file')}</div>
                {i18n('or')}
                <div>
                    <FilePicker onChange={onFile}>{i18n('action_pick-file')}</FilePicker>
                </div>
            </div>
        );
    };

    return (
        <div
            className={block('drag-area', {
                dropable: isDropable,
                empty: isEmpty,
                dragging: isDragging,
            })}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            {renderContent()}
        </div>
    );
};

export default FileDropZone;
