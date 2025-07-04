import React, {FC, useCallback, useMemo} from 'react';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {getQueryDraft, getQueryTrackerSupportedEngines} from '../module/query/selectors';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryEnginesNames} from '../utils/query';
import {createQueryFromTablePath, updateQueryDraft} from '../module/query/actions';

type Props = {
    cluster?: string;
    path?: string;
    onChange?: (value: QueryEngine) => void;
};

export const QueryEngineSelect: FC<Props> = ({onChange, cluster, path}) => {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);
    const supportedEngines = useSelector(getQueryTrackerSupportedEngines);

    const options = useMemo(() => {
        return supportedEngines.map(([key]) => {
            return {
                value: key,
                content: QueryEnginesNames[key as QueryEngine],
            };
        });
    }, [supportedEngines]);

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

    return <Select options={options} value={[draft.engine]} size="l" onUpdate={handleChange} />;
};
