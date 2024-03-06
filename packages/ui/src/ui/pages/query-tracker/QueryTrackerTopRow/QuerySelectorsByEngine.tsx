import React, {ChangeEvent, FC, useCallback} from 'react';
import {QueryClusterSelector} from './QueryClusterSelector';
import {ClusterConfig} from '../../../../shared/yt-types';
import {QueryEngine} from '../module/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {TextInput} from '@gravity-ui/uikit';

type Props = {
    settings?: Record<string, string>;
    engine: QueryEngine;
    clusters: ClusterConfig[];
    cliqueMap: Record<string, {alias: string; yt_operation_id?: string}[]>;
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
    const handlePathChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onPathChange(e.currentTarget.value);
        },
        [onPathChange],
    );

    const cliqueList =
        settings.cluster && settings.cluster in cliqueMap ? cliqueMap[settings.cluster] : [];

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
                <TextInput
                    placeholder="Discovery path"
                    value={settings.discovery_path}
                    onChange={handlePathChange}
                    size="l"
                    hasClear
                    defaultValue={settings.discovery_path}
                    style={{maxWidth: '200px'}}
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
