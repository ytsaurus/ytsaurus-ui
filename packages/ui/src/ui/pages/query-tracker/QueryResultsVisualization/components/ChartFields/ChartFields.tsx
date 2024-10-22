import React, {FC} from 'react';
import {ChartField} from './ChartField';
import block from 'bem-cn-lite';
import './ChartFields.scss';
import {useSelector} from 'react-redux';
import {selectQueryResultVisualizationPlaceholders} from '../../../module/queryChart/selectors';

const b = block('yt-query-chart-fields');

type PlaceholdersContainerProps = {
    availableFields: string[];
};

export const ChartFields: FC<PlaceholdersContainerProps> = ({availableFields}) => {
    const placeholders = useSelector(selectQueryResultVisualizationPlaceholders);

    return (
        <div className={b()}>
            {placeholders.map((placeholder) => (
                <ChartField
                    key={placeholder.id}
                    placeholder={placeholder}
                    availableFields={availableFields}
                />
            ))}
        </div>
    );
};
