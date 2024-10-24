import React, {useCallback} from 'react';
import block from 'bem-cn-lite';
import './ChartField.scss';
import {Placeholder} from '../../types';
import {Button, Icon, Select} from '@gravity-ui/uikit';
import {Plus as PlusIcon} from '@gravity-ui/icons';
import {useDispatch} from 'react-redux';
import {removeField, setField} from '../../../module/queryChart/queryChartSlice';
import {ChartFieldName} from './ChartFieldName';

const b = block('yt-chart-field');

type PlaceholderComponentProps = {
    placeholder: Placeholder;
    availableFields: string[];
};

export const ChartField = ({placeholder, availableFields}: PlaceholderComponentProps) => {
    const {id, field} = placeholder;
    const dispatch = useDispatch();

    const handleRemoveField = useCallback(
        (fieldName: string, placeholderId: string) => {
            dispatch(
                removeField({
                    fieldName,
                    placeholderId,
                }),
            );
        },
        [dispatch],
    );

    const onSelectUpdate = React.useCallback(
        (value: string[]) => {
            dispatch(
                setField({
                    placeholderId: placeholder.id,
                    fieldName: value[0],
                }),
            );
        },
        [dispatch, placeholder.id],
    );

    return (
        <div className={b()}>
            <div className={b('header')}>
                <div className={b('name')}>{id}</div>
                <Select
                    value={[]}
                    filterable={true}
                    options={availableFields.map((item) => ({
                        content: item,
                        value: item,
                        data: item,
                    }))}
                    onUpdate={onSelectUpdate}
                    renderControl={({onClick, ref}) => {
                        return (
                            <Button onClick={onClick} ref={ref}>
                                <Icon data={PlusIcon} size={16} />
                            </Button>
                        );
                    }}
                />
            </div>

            <ChartFieldName
                fieldName={field}
                placeholderId={placeholder.id}
                onRemove={handleRemoveField}
            />
        </div>
    );
};
