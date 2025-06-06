import React from 'react';
import cn from 'bem-cn-lite';
import {Progress} from '@gravity-ui/uikit';

import hammer from '../../common/hammer';

import './FileUploadProgress.scss';

const block = cn('file-upload-progress');

interface FileUploadProgressProps {
    event: {
        total?: number;
        loaded: number;
    };
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({event}) => {
    const {total, loaded} = event;
    const totalStr = hammer.format['Bytes'](total);
    const loadedStr = hammer.format['Bytes'](loaded);

    return (
        <div className={block('progress')}>
            <div className={block('progress-wrapper')}>
                <Progress
                    text={`${loadedStr} / ${totalStr}`}
                    stack={[
                        {
                            value: (100 * loaded) / ((total ?? loaded) || 1),
                            theme: 'info',
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default FileUploadProgress;
