import React, {FC, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../../shared/constants/settings';
import {getQueryDraft, getQueryGetParams} from '../module/query/selectors';
import {resetQueryTracker, setUserLastChoice, updateQueryDraft} from '../module/query/actions';
import {RightButtonsGroup} from './RightButtonsGroup';
import {HeadSpacer} from '../../../containers/ClusterPageHeader/HeadSpacer';
import {Flex, Text, Tooltip} from '@gravity-ui/uikit';
import {QueryEngineSelect, QueryEngineSelector} from '../QueryEngineSelector';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {QueryFilesButton} from '../QueryFilesButton';
import {QuerySelectorsByEngine} from './QuerySelectorsByEngine';
import {QueryEngine} from '../../../../shared/constants/engines';
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
    const {annotations, settings} = useSelector(getQueryDraft);
    const [nameEdit, setNameEdit] = useState(false);
    const isDesktop = useIsDesktop();

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
                        <QuerySelectorsByEngine />
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
