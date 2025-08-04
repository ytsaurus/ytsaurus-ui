import React, {useCallback} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {getQueryDraft} from '../module/query/selectors';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {QueryFilesButton} from '../QueryFilesButton';
import {loadTablePromptToQuery, updateQueryDraft} from '../module/query/actions';
import {NewQueryButton} from '../NewQueryButton';
import {QueryEngineSelector} from '../QueryTrackerTopRow/QueryEngineSelector';
import {QueryTrackerOpenButton} from '../QueryTrackerOpenButton/QueryTrackerOpenButton';

import './QueryMetaForm.scss';
import {QuerySelectorsByEngine} from '../QueryTrackerTopRow/QuerySelectorsByEngine';
import {Flex} from '@gravity-ui/uikit';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryClusterSelector} from '../QueryTrackerTopRow/QueryClusterSelector';

const block = cn('query-tracker-meta-form');
export function QueryMetaForm({
    onClickOnNewQueryButton,
    className,
    cluster,
    path,
}: {
    className: string;
    cluster: string;
    path: string;
    onClickOnNewQueryButton: () => void;
}) {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);

    const onSettingsChange = useCallback(
        (settings: Record<string, string>) => dispatch(updateQueryDraft({settings})),
        [dispatch],
    );

    const handleChangeEngine = useCallback(
        (newEngine: QueryEngine) => {
            dispatch(
                loadTablePromptToQuery(cluster, path, newEngine, {
                    cluster: draft.settings?.cluster!,
                }),
            );
        },
        [dispatch, cluster, path, draft.settings],
    );

    return (
        <Flex className={block(null, className)} gap={3} justifyContent="space-between" grow={1}>
            <Flex gap={3}>
                <QueryClusterSelector className={block('cluster')} />
                <QueryEngineSelector onChange={handleChangeEngine} className={block('engine')} />
                <QuerySelectorsByEngine />
            </Flex>

            <Flex gap={3}>
                <QuerySettingsButton
                    popupClassName={block('settings')}
                    settings={draft.settings}
                    onChange={onSettingsChange}
                />
                <QueryFilesButton popupClassName={block('files')} />
                <NewQueryButton onClick={onClickOnNewQueryButton} hideText />
                <QueryTrackerOpenButton cluster={cluster} path={path} />
            </Flex>
        </Flex>
    );
}
