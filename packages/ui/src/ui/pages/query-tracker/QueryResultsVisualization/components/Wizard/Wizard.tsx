import React, {FC, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectAvailableFields,
    selectChartAxisType,
    selectChartVisualization,
} from '../../../module/queryChart/selectors';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import {FieldKey} from '../../../module/queryChart/queryChartSlice';
import {ChartField} from './ChartField';
import Button from '../../../../../components/Button/Button';
import {useToggle} from 'react-use';
import cn from 'bem-cn-lite';
import {Icon, Select} from '@gravity-ui/uikit';
import {ChartKitWidgetAxisType} from '@gravity-ui/chartkit';
import {changeAxisType, changeField} from '../../../module/queryChart/actions';
import {getAxisNameByType} from '../../helpers/getAxisNameByType';
import './Wizard.scss';

const axisTypes: ChartKitWidgetAxisType[] = ['category', 'datetime', 'linear', 'logarithmic'];

const b = cn('yt-chart-wizard');

export const Wizard: FC = () => {
    const dispatch = useDispatch();
    const {type} = useSelector(selectChartVisualization);
    const {stringColumns, numberColumns} = useSelector(selectAvailableFields);
    const {xField, yField} = useSelector(selectChartVisualization);
    const axisType = useSelector(selectChartAxisType);
    const [addFormVisible, toggleForm] = useToggle(!yField.length);

    useEffect(() => {
        if (!addFormVisible && !yField.length) {
            toggleForm();
        }
    }, [yField, addFormVisible, toggleForm]);

    const availableFiled = useMemo(() => {
        return [...stringColumns, ...numberColumns].filter(
            (field) => !yField.includes(field) && !(field === xField),
        );
    }, [numberColumns, stringColumns, xField, yField]);

    if (!type) return null;

    const config = getAxisNameByType(type);

    const handleOnChange = (data: {value: string; oldValue: string; name: FieldKey}) => {
        dispatch(changeField(data));
    };

    const handleTypeChange = (value: string[]) => {
        dispatch(changeAxisType(value[0] as ChartKitWidgetAxisType));
    };

    const handleAddField = (data: {value: string; oldValue: string; name: FieldKey}) => {
        handleOnChange(data);
        toggleForm();
    };

    return (
        <div className={b()}>
            <ChartField
                label={config.xLabel}
                name="xField"
                availableFields={[...stringColumns, ...numberColumns]}
                value={xField}
                onChange={handleOnChange}
            />
            <Select
                width="max"
                label="Axis type:"
                value={[axisType]}
                filterable
                options={axisTypes.map((item) => ({
                    content: item,
                    value: item,
                    data: item,
                }))}
                onUpdate={handleTypeChange}
            />

            {yField.map((field) => (
                <ChartField
                    key={field}
                    label={config.yLabel}
                    name="yField"
                    availableFields={numberColumns}
                    value={field}
                    onChange={handleOnChange}
                />
            ))}
            {availableFiled.length > 0 && (
                <>
                    {addFormVisible ? (
                        <ChartField
                            label={config.yLabel}
                            name="yField"
                            availableFields={availableFiled}
                            value=""
                            onChange={handleAddField}
                        />
                    ) : (
                        <Button onClick={toggleForm}>
                            <Icon data={PlusIcon} />
                            Add item
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
