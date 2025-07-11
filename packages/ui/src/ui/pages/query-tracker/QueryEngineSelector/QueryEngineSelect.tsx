import React, {FC, useCallback} from 'react';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {
    getClusterLoading,
    getQueryDraft,
    getSupportedEnginesOptions,
} from '../module/query/selectors';
import {QueryEngine} from '../../../../shared/constants/engines';
import {createQueryFromTablePath, updateQueryDraft} from '../module/query/actions';

type Props = {
    cluster?: string;
    path?: string;
    onChange?: (value: QueryEngine) => void;
};

export const QueryEngineSelect: FC<Props> = ({onChange, cluster, path}) => {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);
    const options = useSelector(getSupportedEnginesOptions);
    const loading = useSelector(getClusterLoading);

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
        <Select
            options={options}
            value={[draft.engine]}
            size="l"
            loading={loading}
            disabled={loading}
            onUpdate={handleChange}
        />
    );
};
