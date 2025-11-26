import React, {FC, useCallback, useState} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../../shared/constants/settings';
import {getQueryDraft} from '../../../store/selectors/query-tracker/query';
import {
    resetQueryTracker,
    setQueryEngine,
    setUserLastChoice,
    updateQueryDraft,
} from '../../../store/actions/query-tracker/query';
import {RightButtonsGroup} from './RightButtonsGroup';
import {HeadSpacer} from '../../../containers/ClusterPageHeader/HeadSpacer';
import {Flex, Text, Tooltip} from '@gravity-ui/uikit';
import {QueryEngineSelector} from './QueryEngineSelector';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {QueryFilesButton} from '../QueryFilesButton';
import {QuerySelectorsByEngine} from './QuerySelectorsByEngine';
import {QueryEngine} from '../../../../shared/constants/engines';
import './QueryTrackerTopRow.scss';
import cn from 'bem-cn-lite';
import {EditableAsText} from '../../../components/EditableAsText/EditableAsText';
import {setSettingByKey} from '../../../store/actions/settings';
import {useIsDesktop} from '../../../hooks/useIsDesktop';
import {QueryClusterSelector} from './QueryClusterSelector';
import {LazyQueryTokenButton} from '../QueryToken/lazy';
import {setQueryName} from '../../../store/actions/query-tracker/api';
import {updateQueryInList} from '../../../store/actions/query-tracker/queriesList';

const NAME_PLACEHOLDER = 'No name';
const block = cn('query-tracker-top-row');

const QueryTrackerTopRow: FC = () => {
    const dispatch = useDispatch();
    const isDesktop = useIsDesktop();
    const {id, annotations, settings} = useSelector(getQueryDraft);
    const [nameEdit, setNameEdit] = useState(false);

    const handleChangeEngine = useCallback(
        (newEngine: QueryEngine) => {
            dispatch(setQueryEngine(newEngine));
            dispatch(setSettingByKey(`global::queryTracker::lastEngine`, newEngine));
            dispatch(setUserLastChoice());
        },
        [dispatch],
    );

    const handleCreateNewQuery = useCallback(() => {
        dispatch(resetQueryTracker());
    }, [dispatch]);

    const handleNameChange = useCallback(
        async (title: string | undefined) => {
            dispatch(updateQueryDraft({annotations: {...annotations, title}}));

            if (id && annotations) {
                try {
                    await dispatch(setQueryName(id, {...annotations, title}));
                    dispatch(
                        updateQueryInList(id, {
                            annotations: {...annotations, title},
                        }),
                    );
                } catch (err) {}
            }
        },
        [dispatch, id, annotations],
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
                        <QueryClusterSelector />
                        <QueryEngineSelector isDesktop={isDesktop} onChange={handleChangeEngine} />
                        <QuerySelectorsByEngine />
                        <Flex gap={2}>
                            <QuerySettingsButton
                                settings={settings}
                                onChange={handleSettingsChange}
                            />
                            <QueryFilesButton />
                            <LazyQueryTokenButton />
                        </Flex>
                    </>
                )}
            </Flex>
            <RightButtonsGroup onQueryCreate={handleCreateNewQuery} />
        </RowWithName>
    );
};

export default QueryTrackerTopRow;
