import React, {FC, useCallback} from 'react';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {getQueryDraft} from '../module/query/selectors';
import {Engines} from '../module/api';
import {QueryEnginesNames} from '../utils/query';
import {QueryEngine} from '../../../../shared/constants/engines';
import {createQueryFromTablePath, updateQueryDraft} from '../module/query/actions';

const engineOptions = Engines.map((key) => ({
    value: key,
    content: QueryEnginesNames[key],
}));

type Props = {
    cluster?: string;
    path?: string;
    onChange?: (value: QueryEngine) => void;
};

export const QueryEngineSelect: FC<Props> = ({onChange, cluster, path}) => {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);

    const handleChange = useCallback(
        (value: string[]) => {
            const engine = value[0] as QueryEngine;
            dispatch(updateQueryDraft({engine: engine}));
            if (cluster && path) {
                dispatch(createQueryFromTablePath(engine, cluster, path));
            }
            if (onChange) onChange(engine);
        },
        [onChange, cluster, dispatch, path],
    );

    return (
        <Select options={engineOptions} value={[draft.engine]} size="l" onUpdate={handleChange} />
    );
};
