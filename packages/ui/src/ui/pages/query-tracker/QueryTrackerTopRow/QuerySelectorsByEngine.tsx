import React, {FC, useEffect, useMemo} from 'react';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    getCliqueLoading,
    getCliqueMap,
    getQueryDraft,
} from '../../../store/selectors/query-tracker/query';
import {
    loadCliqueByCluster,
    setQueryClique,
    setQueryPath,
    setQueryYqlVersion,
} from '../../../store/actions/query-tracker/query';
import {Select} from '@gravity-ui/uikit';
import {
    getAvailableYql,
    getEffectiveYqlVersion,
} from '../../../store/selectors/query-tracker/queryAco';
import cn from 'bem-cn-lite';
import './QuerySelectorsByEngine.scss';

const block = cn('yt-query-selector-by-engine');

export const QuerySelectorsByEngine: FC = () => {
    const dispatch = useDispatch();
    const cliqueMap = useSelector(getCliqueMap);
    const cliqueLoading = useSelector(getCliqueLoading);
    const {settings = {}, engine} = useSelector(getQueryDraft);
    const availableYql = useSelector(getAvailableYql);
    const effectiveYqlVersion = useSelector(getEffectiveYqlVersion);
    const currentCluster = settings?.cluster;

    const options = useMemo(() => {
        return availableYql.map((value) => {
            return {value, content: value};
        });
    }, [availableYql]);

    useEffect(() => {
        if ((engine === QueryEngine.CHYT || engine === QueryEngine.SPYT) && currentCluster) {
            dispatch(loadCliqueByCluster(engine, currentCluster));
        }
    }, [engine, currentCluster, dispatch]);

    const handleCliqueChange = (alias: string) => {
        dispatch(setQueryClique(alias));
    };

    const handlePathChange = (newPath: string) => {
        dispatch(setQueryPath(newPath));
    };

    const handleYqlVersionChange = (value: string[]) => {
        dispatch(setQueryYqlVersion(value[0]));
    };

    const clusterCliqueList =
        settings.cluster && settings.cluster in cliqueMap ? cliqueMap[settings.cluster] : {};
    const cliqueList = engine in clusterCliqueList ? clusterCliqueList[engine] : [];

    if (engine === QueryEngine.YQL && availableYql.length) {
        return (
            <Select
                className={block('version')}
                size="l"
                options={options}
                value={effectiveYqlVersion ? [effectiveYqlVersion] : undefined}
                onUpdate={handleYqlVersionChange}
            />
        );
    }

    if (engine === QueryEngine.CHYT || engine === QueryEngine.SPYT) {
        const isChyt = engine === QueryEngine.CHYT;
        return (
            <QueryCliqueSelector
                loading={cliqueLoading}
                cliqueList={cliqueList}
                value={isChyt ? settings.clique : settings.discovery_group}
                onChange={isChyt ? handleCliqueChange : handlePathChange}
                showStatus={isChyt}
                placeholder={isChyt ? undefined : 'Discovery path'}
            />
        );
    }

    return null;
};
