import React, {FC, useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../../shared/constants/settings';
import {
    getCliqueLoading,
    getCliqueMap,
    getQueryDraft,
    getQueryGetParams,
} from '../module/query/selectors';
import {
    loadCliqueByCluster,
    resetQueryTracker,
    setUserLastChoice,
    updateQueryDraft,
} from '../module/query/actions';
import {RightButtonsGroup} from './RightButtonsGroup';
import {HeadSpacer} from '../../../containers/ClusterPageHeader/HeadSpacer';
import {Flex, Text, Tooltip} from '@gravity-ui/uikit';
import {QueryEngineSelect, QueryEngineSelector} from '../QueryEngineSelector';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {QueryFilesButton} from '../QueryFilesButton';
import {getClusterList} from '../../../store/selectors/slideoutMenu';
import {QuerySelectorsByEngine} from './QuerySelectorsByEngine';
import {QueryEngine} from '../module/engines';
import './QueryTrackerTopRow.scss';
import cn from 'bem-cn-lite';
import {EditableAsText} from '../../../components/EditableAsText/EditableAsText';
import {useIsDesktop} from '../../../hooks/useIsDesktop';
import {setSettingByKey} from '../../../store/actions/settings';

const NAME_PLACEHOLDER = 'No name';
const block = cn('query-tracker-top-row');

const QueryTrackerTopRow: FC = () => {
    const dispatch = useDispatch();
    const {cluster, path} = useSelector(getQueryGetParams);
    const {annotations, settings, engine} = useSelector(getQueryDraft);
    const clusters = useSelector(getClusterList);
    const cliqueMap = useSelector(getCliqueMap);
    const cliqueLoading = useSelector(getCliqueLoading);
    const [nameEdit, setNameEdit] = useState(false);
    const isDesktop = useIsDesktop();

    const currentCluster = settings?.cluster;

    useEffect(() => {
        if ((engine === QueryEngine.CHYT || engine === QueryEngine.SPYT) && settings?.cluster) {
            dispatch(loadCliqueByCluster(engine, settings.cluster));
        }
    }, [engine, settings?.cluster, dispatch]);

    const handleChangeEngine = useCallback(
        (newEngine: QueryEngine) => {
            const newSettings = {...settings};

            if (newEngine !== QueryEngine.SPYT) {
                delete newSettings.discovery_group;
                delete newSettings.discovery_path; // old request type. Deprecated
            }

            if (newEngine !== QueryEngine.CHYT) {
                delete newSettings.clique;
            }

            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(setSettingByKey(`global::queryTracker::lastEngine`, newEngine));
            dispatch(setUserLastChoice());
        },
        [dispatch, settings],
    );

    const handleCreateNewQuery = useCallback(() => {
        dispatch(resetQueryTracker());
    }, [dispatch]);

    const handleNameChange = useCallback(
        (title: string | undefined) => {
            dispatch(updateQueryDraft({annotations: {title}}));
        },
        [dispatch],
    );

    const handleSettingsChange = useCallback(
        (newSettings: Record<string, string>) =>
            dispatch(updateQueryDraft({settings: newSettings})),
        [dispatch],
    );

    const handleClusterChange = useCallback(
        (clusterId: string) => {
            const newSettings: Record<string, string> = settings ? {...settings} : {};
            if (clusterId) {
                newSettings.cluster = clusterId;
            } else {
                delete newSettings['cluster'];
            }
            delete newSettings['clique'];
            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(setUserLastChoice(true));
        },
        [dispatch, settings],
    );

    const handleCliqueChange = useCallback(
        (alias: string) => {
            const newSettings: Record<string, string> = settings ? {...settings} : {};
            if (!alias && 'clique' in newSettings) {
                delete newSettings.clique;
            } else {
                newSettings.clique = alias;
            }
            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(
                setSettingByKey(`local::${currentCluster}::queryTracker::lastChytClique`, alias),
            );
        },
        [currentCluster, dispatch, settings],
    );

    const handlePathChange = useCallback(
        (newPath: string) => {
            dispatch(updateQueryDraft({settings: {...settings, discovery_group: newPath}}));
            dispatch(
                setSettingByKey(
                    `local::${currentCluster}::queryTracker::lastDiscoveryPath`,
                    newPath,
                ),
            );
        },
        [currentCluster, dispatch, settings],
    );

    const name = annotations?.title || NAME_PLACEHOLDER;

    return (
        <RowWithName page={Page.QUERIES} className={block()}>
            <Flex alignItems="center" gap={4} grow={1}>
                <EditableAsText
                    className={block('name-input')}
                    onChange={handleNameChange}
                    size="l"
                    text={annotations?.title}
                    cancelOnClose
                    withControls
                    openOnClick
                    onModeChange={setNameEdit}
                    saveButtonView="action"
                    cancelButtonView="outlined"
                >
                    <Tooltip content={name}>
                        <Text ellipsis>{name}</Text>
                    </Tooltip>
                </EditableAsText>

                {!nameEdit && (
                    <>
                        <HeadSpacer />
                        {isDesktop ? (
                            <QueryEngineSelector
                                cluster={cluster}
                                path={path}
                                onChange={handleChangeEngine}
                            />
                        ) : (
                            <QueryEngineSelect onChange={handleChangeEngine} />
                        )}
                        <QuerySelectorsByEngine
                            settings={settings}
                            engine={engine}
                            clusters={clusters}
                            cliqueMap={cliqueMap}
                            cliqueLoading={cliqueLoading}
                            onClusterChange={handleClusterChange}
                            onCliqueChange={handleCliqueChange}
                            onPathChange={handlePathChange}
                        />
                        <Flex gap={2}>
                            <QuerySettingsButton
                                settings={settings}
                                onChange={handleSettingsChange}
                            />
                            <QueryFilesButton />
                        </Flex>
                    </>
                )}
            </Flex>
            <RightButtonsGroup onQueryCreate={handleCreateNewQuery} />
        </RowWithName>
    );
};

export default QueryTrackerTopRow;
