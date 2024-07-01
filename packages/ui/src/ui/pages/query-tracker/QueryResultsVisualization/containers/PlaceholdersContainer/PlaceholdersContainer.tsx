import React from 'react';
import {PlaceholderComponent} from './Placeholder/Placeholder';
import {Field} from '../../types';
import block from 'bem-cn-lite';
import './PlaceholdersContainer.scss';
import {useSelector} from 'react-redux';
import {selectQueryResultVisualizationPlaceholders} from '../../store/selectors';

const b = block('placeholders-container');

type PlaceholdersContainerProps = {
    availableFields: Field[];
};

export const PlaceholdersContainer = (props: PlaceholdersContainerProps) => {
    const placeholders = useSelector(selectQueryResultVisualizationPlaceholders);

    return (
        <div className={b()}>
            {placeholders.map((placeholder) => (
                <div className={b('placeholder-wrapper')} key={placeholder.id}>
                    <PlaceholderComponent placeholder={placeholder} {...props} />
                </div>
            ))}
        </div>
    );
};
