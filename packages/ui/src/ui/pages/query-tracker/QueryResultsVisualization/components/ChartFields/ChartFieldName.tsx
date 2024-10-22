import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import {Xmark as XmarkIcon} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import './ChartFieldName.scss';

const b = cn('yt-chart-field-name');

type Props = {
    fieldName: string;
    placeholderId: string;
    onRemove: (fieldName: string, placeholderId: string) => void;
};

export const ChartFieldName: FC<Props> = ({fieldName, placeholderId, onRemove}) => {
    if (!fieldName) return null;

    const handleRemoveField = () => {
        onRemove(fieldName, placeholderId);
    };

    return (
        <div key={fieldName} className={b()}>
            <div className={b('spacer')}></div>
            <div className={b('title')} title={fieldName}>
                {fieldName}
            </div>
            <div className={b('actions')}>
                <Button onClick={handleRemoveField}>
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </div>
        </div>
    );
};
