import React, {useEffect, useState} from 'react';
import {QueryPage} from '@gravity-ui/querieskit/pages/QueryPage';
import {Flex, Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectDirtySinceLastSubmit,
    selectIsQueryLoading,
    selectQueryDraft,
    selectShouldPollCliqueWhenInactive,
} from '../../../store/selectors/query-tracker/query';
import {setFileEditor} from '../../../store/reducers/query-tracker/queryFilesFormSlice';
import {selectQuerySessionRevision} from '../../../store/selectors/query-tracker/querySession';
import {selectFileEditorConfig} from '../../../store/selectors/query-tracker/queryFilesForm';
import {resetQueryTracker} from '../../../store/actions/query-tracker/query';
import {setSettingByKey} from '../../../store/actions/settings';
import {updateTitle} from '../../../store/actions/global';
import {useQueriesListSidebarToggle} from '../hooks/QueriesList';
import {useQueryACO} from '../QueryACO/useQueryACO';
import {useCurrentQuery} from '../QueryResults/hooks/useCurrentQuery';
import {NewQueryPromt} from '../NewQueryButton/NewQueryButton';
import {useQueriesSidebar} from '../QueriesList/useQueriesSidebar';
import {useQueryExecution} from '../QueryEditor/QueryExecutionView/useQueryExecution';
import {QueryFileWorkspace} from './QueryFileWorkspace/QueryFileWorkspace';
import {useQueryEditorProps} from './useQueryEditorProps';
import {getQueryStatus} from '../queriesKitStatus';
import format from '../../../common/hammer/format';
import i18n from '../QueryTrackerTopRow/i18n';
import {CliqueDisabledBlock} from '../QueryEditor/QueryEditorView/CliqueDisabledBlock';
import './QueriesPage.scss';

const block = cn('yt-queries-page');
type Props = {onStartQuery: (id: string) => boolean | void};

export function QueriesPage({onStartQuery}: Props) {
    const revision = useSelector(selectQuerySessionRevision);
    const workspaceId = `query-${revision}`;
    const dispatch = useDispatch();
    const query = useCurrentQuery();
    const draft = useSelector(selectQueryDraft);
    const dirty = useSelector(selectDirtySinceLastSubmit);
    const loading = useSelector(selectIsQueryLoading);
    const inactiveClique = useSelector(selectShouldPollCliqueWhenInactive);
    const {fileEditor: file, file: editedFile} = useSelector(selectFileEditorConfig);
    useEffect(() => {
        if (file.isOpen && !editedFile) {
            dispatch(setFileEditor({...file, isOpen: false, isFullWidth: false}));
        }
    }, [dispatch, file, editedFile]);
    const {isQueryTrackerInfoLoading} = useQueryACO();
    const sidebarProps = useQueriesSidebar();
    const {isQueriesListSidebarVisible} = useQueriesListSidebarToggle();
    const [collapsed, setCollapsed] = useState(!query?.id);
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        dispatch(
            setFileEditor({isOpen: false, isFullWidth: false, fileId: null, fileType: 'file'}),
        );
        setExpanded(false);
        setCollapsed(!query?.id);
    }, [dispatch, revision, query?.id]);
    const [confirmNew, setConfirmNew] = useState(false);
    const active = !(file.isOpen && file.isFullWidth);
    const execution = useQueryExecution({query, collapsed, active});
    const {editorProps, modal} = useQueryEditorProps({onStartQuery, active: active && !expanded});

    useEffect(() => {
        if (!query?.id) return;
        dispatch(
            updateTitle({
                path: `${query.annotations?.title || ''} ${query.state?.toUpperCase() || ''} ${format.DateTime(query.start_time, {pattern: 'D MMM YYYY, HH:mm:ss'})} @ ${query.engine}`,
            }),
        );
    }, [dispatch, query]);

    const create = () => {
        setConfirmNew(false);
        dispatch(resetQueryTracker());
    };
    return (
        <div className={block()} data-qa="queries-page">
            {inactiveClique && (
                <Flex gap={2} alignItems="center">
                    <CliqueDisabledBlock />
                </Flex>
            )}
            <QueryPage
                className={block('page')}
                sidebarProps={sidebarProps}
                sidebarCollapsed={!isQueriesListSidebarVisible}
                onSidebarCollapsedChange={(next) =>
                    dispatch(
                        setSettingByKey(
                            'global::queryTracker::queriesListSidebarVisibilityMode',
                            !next,
                        ),
                    )
                }
                tabsProps={{
                    activeTab: workspaceId,
                    onActiveTabChange: () => {},
                    onAddTab: () => (dirty ? setConfirmNew(true) : create()),
                    onCloseTab: () => {},
                    hideCloseOnLastTab: true,
                    items: [
                        {
                            id: workspaceId,
                            type: 'query',
                            title: draft.annotations?.title || i18n('field_no-name'),
                            status: getQueryStatus(query?.state),
                            isModified: dirty,
                            editorProps,
                            executionPanelProps: {
                                ...execution.props,
                                collapsed,
                                expanded,
                                onExpandedChange: setExpanded,
                                onCollapsedChange: setCollapsed,
                            },
                            renderWorkspace: ({children}) => (
                                <QueryFileWorkspace>{children}</QueryFileWorkspace>
                            ),
                        },
                    ],
                }}
            />
            {(loading || isQueryTrackerInfoLoading) && (
                <div className={block('loading')}>
                    <Loader />
                </div>
            )}
            {execution.modal}
            {modal}
            <NewQueryPromt
                visible={confirmNew}
                confirm={create}
                cancel={() => setConfirmNew(false)}
            />
        </div>
    );
}
