import React, {FC} from 'react';
import {Checkbox, CheckboxProps, Icon, Tooltip} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import cn from 'bem-cn-lite';
import './FormOptionItem.scss';
import {PathAttribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';

const block = cn('form-option-item');

type Props = {
    name: PathAttribute;
    tooltip: string;
    onUpdate: (key: PathAttribute, value: boolean) => void;
} & Pick<CheckboxProps, 'checked'>;

export const FormOptionItem: FC<Props> = ({name, tooltip, checked, onUpdate}) => {
    const handleUpdate = (value: boolean) => {
        onUpdate(name, value);
    };

    return (
        <div className={block()}>
            <Checkbox checked={checked} onUpdate={handleUpdate}>
                {name}
            </Checkbox>

            <Tooltip content={tooltip} className={block('tooltip')}>
                <Icon data={CircleQuestionIcon} className={block('info')} size={16} />
            </Tooltip>
        </div>
    );
};
