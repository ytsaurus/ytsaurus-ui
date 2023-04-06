import React, {useCallback, useMemo} from 'react';
import {ControlGroupOption, RadioButton} from '@gravity-ui/uikit';
import {Engines, QueryEngine} from '../../module/api';
import {QueryEnginesNames} from '../../utils/query';

const ALL_ENGINE_KEY = '__all';

export function QueryEngineFilter({
    value,
    onChange,
    className,
    engines = Engines,
}: {
    engines?: QueryEngine[];
    value?: QueryEngine;
    className?: string;
    onChange: (value?: QueryEngine) => void;
}) {
    const enginesList = useMemo<ControlGroupOption[]>(() => {
        return [
            {
                value: ALL_ENGINE_KEY,
                content: 'All',
            },
            ...engines.map((engine) => {
                return {
                    value: engine,
                    content: QueryEnginesNames[engine],
                };
            }),
        ];
    }, [engines]);

    const onChangeEngineFilter = useCallback(
        (engine: string) => {
            onChange(engine === ALL_ENGINE_KEY ? undefined : (engine as QueryEngine));
        },
        [onChange],
    );
    return (
        <RadioButton
            className={className}
            options={enginesList}
            value={value || ALL_ENGINE_KEY}
            onUpdate={onChangeEngineFilter}
        />
    );
}
