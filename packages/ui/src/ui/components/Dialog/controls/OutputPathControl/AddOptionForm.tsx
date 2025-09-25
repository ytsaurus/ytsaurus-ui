import React, {FC, useMemo, useRef} from 'react';
import {Button, Icon, Popup} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import {useToggle} from 'react-use';
import './AddOptionForm.scss';
import cn from 'bem-cn-lite';
import {FormOptionItem} from './FormOptionItem';
import {getTooltipByType} from './getTooltipByType';
import {
    PathAttribute,
    TableSortMergeModal,
} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';

const popup = cn('add-option-form');

type Props = {
    attributes: TableSortMergeModal['outputPathAttributes'];
    onChange: (key: PathAttribute, isActive: boolean) => void;
};

export const AddOptionForm: FC<Props> = ({attributes, onChange}) => {
    const btnRef = useRef(null);
    const [isOpen, toggleOpen] = useToggle(false);

    const items = useMemo(() => {
        return Object.values(attributes).map(({active, type}) => (
            <FormOptionItem
                key={type}
                name={type}
                onUpdate={onChange}
                tooltip={getTooltipByType(type) || ''}
                checked={active}
            />
        ));
    }, [attributes, onChange]);

    return (
        <>
            <Button ref={btnRef} view="outlined" onClick={toggleOpen}>
                <Icon data={PlusIcon} size={16} />
            </Button>
            <Popup
                anchorElement={btnRef.current}
                open={isOpen}
                placement="bottom"
                onOpenChange={(open) => {
                    if (!open) {
                        toggleOpen();
                    }
                }}
            >
                <div className={popup()}>{items}</div>
            </Popup>
        </>
    );
};
