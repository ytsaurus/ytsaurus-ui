import React from 'react';
import {Select} from '@gravity-ui/uikit';
import {Engines} from '../../../../../types/query-tracker/api';
import {type QueryEngine, QueryEnginesNames} from '../../../../../../shared/constants/engines';
import i18n from './i18n';

const ALL_ENGINE_KEY = '__all';
const getEnginesList = () => [
    {value: ALL_ENGINE_KEY, content: i18n('value_all')},
    ...Engines.map((value) => ({value, content: QueryEnginesNames[value]})),
];

type Props = {
    value?: QueryEngine;
    onUpdate: (value: QueryEngine | undefined) => void;
};

export function QueryEngineFilter({value, onUpdate}: Props) {
    return (
        <Select
            options={getEnginesList()}
            value={[value || ALL_ENGINE_KEY]}
            onUpdate={([engine]) => onUpdate(Engines.find((item) => item === engine))}
            placeholder={i18n('context_select-engine')}
            aria-label={i18n('context_select-engine')}
        />
    );
}
