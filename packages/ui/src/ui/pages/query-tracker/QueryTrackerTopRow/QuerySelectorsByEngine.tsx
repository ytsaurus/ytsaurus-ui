import React, {FC} from 'react';
import {QueryClusterSelector} from './QueryClusterSelector';
import {ClusterConfig} from '../../../../shared/yt-types';
import {QueryEngine} from '../module/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';

type Props = {
    settings?: Record<string, string>;
    engine: QueryEngine;
    clusters: ClusterConfig[];
    cliqueMap: Record<string, Record<string, {alias: string; yt_operation_id?: string}[]>>;
    cliqueLoading: boolean;
    onClusterChange: (clusterId: string) => void;
    onCliqueChange: (alias: string) => void;
    onPathChange: (path: string) => void;
};
export const QuerySelectorsByEngine: FC<Props> = ({
    settings = {},
    clusters,
    cliqueMap,
    cliqueLoading,
    engine,
    onClusterChange,
    onCliqueChange,
    onPathChange,
}) => {
    const clusterCliqueList =
        settings.cluster && settings.cluster in cliqueMap ? cliqueMap[settings.cluster] : {};
    const cliqueList = engine in clusterCliqueList ? clusterCliqueList[engine] : [];

    if (engine === QueryEngine.CHYT) {
        return (
            <>
                <QueryClusterSelector
                    clusters={clusters}
                    value={settings.cluster}
                    onChange={onClusterChange}
                />
                <QueryCliqueSelector
                    loading={cliqueLoading}
                    cliqueList={cliqueList}
                    value={settings.clique}
                    onChange={onCliqueChange}
                />
            </>
        );
    }

    if (engine === QueryEngine.SPYT) {
        return (
            <>
                <QueryClusterSelector
                    clusters={clusters}
                    value={settings.cluster}
                    onChange={onClusterChange}
                />
                <QueryCliqueSelector
                    loading={cliqueLoading}
                    cliqueList={cliqueList}
                    value={settings.discovery_group}
                    onChange={onPathChange}
                />
            </>
        );
    }

    return (
        <QueryClusterSelector
            clusters={clusters}
            value={settings.cluster}
            onChange={onClusterChange}
        />
    );
};
