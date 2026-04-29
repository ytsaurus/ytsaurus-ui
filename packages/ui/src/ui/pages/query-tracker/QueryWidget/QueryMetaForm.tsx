import React, {useCallback} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectQueryDraft, selectQueryEngine} from '../../../store/selectors/query-tracker/query';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {QueryFilesButton} from '../QueryFilesButton';
import {updateQueryDraft} from '../../../store/actions/query-tracker/query';
import {NewQueryButton} from '../NewQueryButton';
import {QueryEngineSelector} from '../QueryTrackerTopRow/QueryEngineSelector';
import {QueryTrackerOpenButton} from '../QueryTrackerOpenButton/QueryTrackerOpenButton';

import './QueryMetaForm.scss';
import {QuerySelectorsByEngine} from '../QueryTrackerTopRow/QuerySelectorsByEngine';
import {Flex} from '@gravity-ui/uikit';
import {QueryClusterSelector} from '../QueryTrackerTopRow/QueryClusterSelector';
import {type DraftQuery} from '../../../types/query-tracker/api';

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
    const draft = useSelector(selectQueryDraft);
    const engine = useSelector(selectQueryEngine);

    const onSettingsChange = useCallback(
        (settings: DraftQuery['settings']) => dispatch(updateQueryDraft({settings})),
        [dispatch],
    );

    return (
        <Flex className={block(null, className)} gap={3} justifyContent="space-between" grow={1}>
            <Flex gap={3}>
                <QueryClusterSelector className={block('cluster')} />
                <QueryEngineSelector
                    className={block('engine')}
                    tableCluster={cluster}
                    tablePath={path}
                />
                <QuerySelectorsByEngine />
            </Flex>

            <Flex gap={3}>
                <QuerySettingsButton
                    popupClassName={block('settings')}
                    settings={draft.settings}
                    engine={engine}
                    onChange={onSettingsChange}
                />
                <QueryFilesButton popupClassName={block('files')} />
                <NewQueryButton onClick={onClickOnNewQueryButton} hideText />
                <QueryTrackerOpenButton cluster={cluster} path={path} />
            </Flex>
        </Flex>
    );
}
