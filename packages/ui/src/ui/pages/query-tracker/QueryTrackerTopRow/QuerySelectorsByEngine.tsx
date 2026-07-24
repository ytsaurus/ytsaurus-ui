import React, {type FC, useEffect, useMemo} from 'react';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectCliqueLoading,
    selectCliqueMap,
    selectQueryDraft,
} from '../../../store/selectors/query-tracker/query';
import {
    loadCliqueByCluster,
    setQueryClique,
    setQueryPath,
    setQueryYqlVersion,
} from '../../../store/actions/query-tracker/query';
import {Select} from '@gravity-ui/uikit';
import {
    selectAvailableYql,
    selectEffectiveYqlVersion,
} from '../../../store/selectors/query-tracker/queryAco';
import cn from 'bem-cn-lite';
import './QuerySelectorsByEngine.scss';
import {selectAvailableSpytConnect} from '../../../store/selectors/query-tracker/queryTrackerEnginesInfo';

const block = cn('yt-query-selector-by-engine');

export const QuerySelectorsByEngine: FC = () => {
    const dispatch = useDispatch();
    const cliqueMap = useSelector(selectCliqueMap);
    const cliqueLoading = useSelector(selectCliqueLoading);
    const {settings = {}, engine} = useSelector(selectQueryDraft);
    const availableYql = useSelector(selectAvailableYql);
    const effectiveYqlVersion = useSelector(selectEffectiveYqlVersion);
    const hasSpytConnect = useSelector(selectAvailableSpytConnect);
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
    const hasLoadedCliqueList = engine in clusterCliqueList;
    const cliqueList = hasLoadedCliqueList ? clusterCliqueList[engine] : [];

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

    if (engine === QueryEngine.SPYT) {
        if (hasSpytConnect) return null;

        return (
            <QueryCliqueSelector
                loading={cliqueLoading}
                cliqueList={cliqueList}
                value={settings.discovery_group}
                onChange={handlePathChange}
                placeholder="Discovery path"
            />
        );
    }

    if (engine === QueryEngine.CHYT) {
        const cliqueListIsReady = !cliqueLoading && hasLoadedCliqueList;
        const queryClique = settings.clique;

        const isQueryCliqueInCliqueList = cliqueList.some(({alias}) => alias === queryClique);
        const cliqueToDisplay =
            !cliqueListIsReady || isQueryCliqueInCliqueList ? queryClique : undefined;

        return (
            <QueryCliqueSelector
                loading={cliqueLoading}
                cliqueList={cliqueList}
                value={cliqueToDisplay}
                onChange={handleCliqueChange}
                showStatus
            />
        );
    }

    return null;
};
