import React, {useCallback} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {getQueryDraft} from '../module/query/selectors';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {QueryFilesButton} from '../QueryFilesButton';
import {updateQueryDraft} from '../module/query/actions';
import {NewQueryButton} from '../NewQueryButton';
import {QueryEngineSelect} from '../QueryEngineSelector';
import {QueryTrackerOpenButton} from '../QueryTrackerOpenButton/QueryTrackerOpenButton';

import './QueryMetaForm.scss';
import {QuerySelectorsByEngine} from '../QueryTrackerTopRow/QuerySelectorsByEngine';
import {Flex} from '@gravity-ui/uikit';
import {QueryEngine} from '../../../../shared/constants/engines';

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
            const newSettings = {...draft.settings};

            if (newEngine !== QueryEngine.SPYT) {
                delete newSettings.discovery_group;
            }

            if (newEngine !== QueryEngine.CHYT) {
                delete newSettings.clique;
            }

            dispatch(updateQueryDraft({settings: newSettings}));
        },
        [dispatch, draft.settings],
    );

    return (
        <Toolbar
            className={block(null, className)}
            itemsToWrap={[
                {
                    name: 'Engine',
                    marginRight: 'half',
                    node: <QueryEngineSelect onChange={handleChangeEngine} />,
                },
                {
                    name: 'Configs',
                    marginRight: 'half',
                    node: (
                        <Flex gap={3}>
                            <QuerySelectorsByEngine />
                        </Flex>
                    ),
                },
                {
                    name: 'Settings',
                    marginRight: 'half',
                    node: (
                        <QuerySettingsButton
                            settings={draft.settings}
                            onChange={onSettingsChange}
                        />
                    ),
                },
                {
                    name: 'Files',
                    marginRight: 'half',
                    node: <QueryFilesButton />,
                },
                {
                    name: 'NewQuery',
                    marginRight: 'half',
                    node: <NewQueryButton onClick={onClickOnNewQueryButton} hideText />,
                },
                {
                    name: 'OpenPage',
                    marginRight: 'half',
                    node: <QueryTrackerOpenButton cluster={cluster} path={path} />,
                },
            ]}
        />
    );
}
