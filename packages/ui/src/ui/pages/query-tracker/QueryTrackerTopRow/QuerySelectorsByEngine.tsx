import React, {FC, useEffect} from 'react';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {useDispatch, useSelector} from 'react-redux';
import {
    getCliqueLoading,
    getCliqueMap,
    getQueryDraft,
} from '../../../store/selectors/queries/query';
import {
    loadCliqueByCluster,
    setQueryClique,
    setQueryPath,
} from '../../../store/actions/queries/query';

export const QuerySelectorsByEngine: FC = () => {
    const dispatch = useDispatch();
    const cliqueMap = useSelector(getCliqueMap);
    const cliqueLoading = useSelector(getCliqueLoading);
    const {settings = {}, engine} = useSelector(getQueryDraft);
    const currentCluster = settings?.cluster;

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

    const clusterCliqueList =
        settings.cluster && settings.cluster in cliqueMap ? cliqueMap[settings.cluster] : {};
    const cliqueList = engine in clusterCliqueList ? clusterCliqueList[engine] : [];

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
