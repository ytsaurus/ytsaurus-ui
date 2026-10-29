import React, {type FC} from 'react';
import {Select} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {useQueryEngineSettings} from '../hooks/useQueryEngineSettings';
import './QuerySelectorsByEngine.scss';

const block = cn('yt-query-selector-by-engine');

export const QuerySelectorsByEngine: FC = () => {
    const {
        engine,
        settings,
        loading,
        versions,
        yqlVersion,
        connectAvailable,
        cliques,
        clique,
        changeClique,
        changeDiscoveryGroup,
        changeYqlVersion,
    } = useQueryEngineSettings();
    const options = versions.map((value) => ({value, content: value}));

    if (engine === QueryEngine.YQL && versions.length) {
        return (
            <Select
                className={block('version')}
                size="l"
                options={options}
                value={yqlVersion ? [yqlVersion] : undefined}
                onUpdate={(value) => changeYqlVersion(value[0])}
            />
        );
    }

    if (engine === QueryEngine.SPYT) {
        if (connectAvailable) return null;

        return (
            <QueryCliqueSelector
                loading={loading}
                cliqueList={cliques ?? []}
                value={settings.discovery_group}
                onChange={changeDiscoveryGroup}
                placeholder="Discovery path"
            />
        );
    }

    if (engine === QueryEngine.CHYT) {
        return (
            <QueryCliqueSelector
                loading={loading}
                cliqueList={cliques ?? []}
                value={clique}
                onChange={changeClique}
                showStatus
            />
        );
    }

    return null;
};
