import React, {useCallback, useMemo} from 'react';
import {Select, SelectOption} from '@gravity-ui/uikit';
import {selectQueryResultIndex} from '../../store/selectors';
import {useSelector} from 'react-redux';
import {useThunkDispatch} from '../../../../../store/thunkDispatch';

type QueryResultSelectProps = {
    resultCount: number;
};

export function QueryResultSelect({resultCount}: QueryResultSelectProps) {
    const resultIndex = useSelector(selectQueryResultIndex);
    const dispatch = useThunkDispatch();

    const options = useMemo(() => {
        const result: SelectOption[] = [];

        for (let i = 0; i < resultCount; i++) {
            result.push({
                value: String(i),
                content: `Result #${i + 1}`,
            });
        }
        return result;
    }, [resultCount]);

    const onUpdate = useCallback(([value]: string[]) => {
        dispatch({
            type: 'set-result-index',
            data: Number(value),
        });
    }, []);

    const value = [String(resultIndex)];

    if (options.length === 1) {
        return null;
    }

    return <Select width="max" value={value} options={options} onUpdate={onUpdate} />;
}
