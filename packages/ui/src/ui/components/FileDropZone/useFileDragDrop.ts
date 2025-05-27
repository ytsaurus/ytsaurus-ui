import * as React from 'react';
import {useCallback, useState} from 'react';

export const useFileDragDrop = (onFile: (files: FileList | null) => void) => {
    // Track drag state to provide visual feedback
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const onDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);

            const {files} = event.dataTransfer;

            if (!files) {
                return;
            }

            onFile(files);
        },
        [onFile],
    );

    return {
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
        isDragging,
    };
};

export default useFileDragDrop;
