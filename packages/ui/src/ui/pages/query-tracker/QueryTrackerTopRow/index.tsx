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
import {loadCliqueByCluster, resetQueryTracker, updateQueryDraft} from '../module/query/actions';
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
import {getCluster} from '../../../store/selectors/global';
import {getFavoriteQuerySettings} from '../../../store/selectors/settings/settings-queries';

const NAME_PLACEHOLDER = 'No name';
const block = cn('query-tracker-top-row');

const QueryTrackerTopRow: FC = () => {
    const dispatch = useDispatch();
    const currentCluster = useSelector(getCluster);
    const {cluster, path} = useSelector(getQueryGetParams);
    const {annotations, settings, engine} = useSelector(getQueryDraft);
    const favoriteSettings = useSelector(getFavoriteQuerySettings);
    const clusters = useSelector(getClusterList);
    const cliqueMap = useSelector(getCliqueMap);
    const cliqueLoading = useSelector(getCliqueLoading);
    const [nameEdit, setNameEdit] = useState(false);
    const isDesktop = useIsDesktop();

    useEffect(() => {
        if ((engine === QueryEngine.CHYT || engine === QueryEngine.SPYT) && settings?.cluster) {
            dispatch(loadCliqueByCluster(engine, settings.cluster));
        }
    }, [engine, settings?.cluster, dispatch]);

    const handleChangeEngine = useCallback(
        (newEngine: QueryEngine) => {
            const newSettings = {...settings};

            const engineType = {
                isSpyt: newEngine === QueryEngine.SPYT,
                isChyt: newEngine === QueryEngine.CHYT,
            };

            if (!engineType.isSpyt) {
                delete newSettings.discovery_group;
                delete newSettings.discovery_path; // old request type. Deprecated
            }

            if (!engineType.isChyt) {
                delete newSettings.clique;
            }

            if (engineType.isSpyt && favoriteSettings.path) {
                newSettings.discovery_group = newSettings.discovery_group || favoriteSettings.path;
            }

            if (engineType.isChyt && favoriteSettings.clique) {
                newSettings.clique = newSettings.clique || favoriteSettings.clique;
            }

            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(
                setSettingByKey(
                    `local::${currentCluster}::queryTracker::favoriteEngine`,
                    newEngine,
                ),
            );
        },
        [currentCluster, dispatch, favoriteSettings.clique, favoriteSettings.path, settings],
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
                setSettingByKey(`local::${currentCluster}::queryTracker::favoriteClique`, alias),
            );
        },
        [dispatch, settings],
    );

    const handlePathChange = useCallback(
        (newPath: string) => {
            dispatch(updateQueryDraft({settings: {...settings, discovery_group: newPath}}));
            dispatch(
                setSettingByKey(`local::${currentCluster}::queryTracker::favoritePath`, newPath),
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
