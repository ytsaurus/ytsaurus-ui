import React from 'react';
import cn from 'bem-cn-lite';
import {Progress} from '@gravity-ui/uikit';
import {calcProgressProps} from '../../utils/utils';

import './FileUploadProgress.scss';

const block = cn('file-upload-progress');

interface FileUploadProgressProps {
    event: {
        total?: number;
        loaded: number;
    };
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({event}) => {
    const {total = 0, loaded = 0} = event;
    const progress = calcProgressProps(loaded, total, 'Bytes');

    return (
        <div className={block('progress')}>
            <div className={block('progress-wrapper')}>
                <Progress
                    text={progress.text}
                    stack={[
                        {
                            value: progress.value ?? 0,
                            theme: progress.theme,
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default FileUploadProgress;
