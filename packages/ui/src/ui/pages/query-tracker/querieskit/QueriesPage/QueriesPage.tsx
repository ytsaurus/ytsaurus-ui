import React, {useId, useState} from 'react';
import noop_ from 'lodash/noop';
import {QueryPageLayout} from '@gravity-ui/querieskit/modules/QueryPageLayout';
import {QueriesSidebar} from '@gravity-ui/querieskit/widgets/QueriesSidebar';
import {QueryTabs} from '@gravity-ui/querieskit/modules/QueryTabs';
import {useCurrentQuery} from '../../QueryResults/hooks/useCurrentQuery';
import {getQueryStatus} from '../queriesKitStatus';
import {Flex, Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectIsQueryLoading,
    selectIsQueryTextDirty,
    selectQueryDraft,
    selectQuerySessionRevision,
    selectShouldPollCliqueWhenInactive,
} from '../../../../store/selectors/query-tracker/query';
import {resetQueryTracker} from '../../../../store/actions/query-tracker/query';
import {setSettingByKey} from '../../../../store/actions/settings';
import {useQueriesListSidebarToggle} from '../../hooks/QueriesList';
import {useQueryACO} from '../../QueryACO/useQueryACO';
import {NewQueryPromt} from '../../NewQueryButton/NewQueryButton';
import {useQueriesSidebar} from '../useQueriesSidebar';
import {QueryWorkspace} from './QueryWorkspace/QueryWorkspace';
import i18n from '../../QueryTrackerTopRow/i18n';
import {CliqueDisabledBlock} from '../../QueryEditor/QueryEditorView/CliqueDisabledBlock';
import './QueriesPage.scss';

const block = cn('yt-queries-page');
type Props = {onStartQuery: (id: string) => boolean | void};

export function QueriesPage({onStartQuery}: Props) {
    const query = useCurrentQuery();
    const panelId = useId();
    const [newQueryPromptVisible, setNewQueryPromptVisible] = useState(false);
    const revision = useSelector(selectQuerySessionRevision);
    const dispatch = useDispatch();
    const draft = useSelector(selectQueryDraft);
    const dirty = useSelector(selectIsQueryTextDirty);
    const loading = useSelector(selectIsQueryLoading);
    const inactiveClique = useSelector(selectShouldPollCliqueWhenInactive);
    const {isQueryTrackerInfoLoading} = useQueryACO();
    const sidebarProps = useQueriesSidebar();
    const {isQueriesListSidebarVisible} = useQueriesListSidebarToggle();
    const createQuery = () => {
        dispatch(resetQueryTracker());
        setNewQueryPromptVisible(false);
    };
    const handleAddQuery = () => {
        if (dirty) {
            setNewQueryPromptVisible(true);
            return;
        }
        createQuery();
    };

    return (
        <div className={block()} data-qa="queries-page">
            {inactiveClique && (
                <Flex gap={2} alignItems="center">
                    <CliqueDisabledBlock />
                </Flex>
            )}
            <QueryPageLayout
                className={block('page')}
                sidebar={<QueriesSidebar {...sidebarProps} />}
                sidebarCollapsed={!isQueriesListSidebarVisible}
                onSidebarCollapsedChange={(next) =>
                    dispatch(
                        setSettingByKey(
                            'global::queryTracker::queriesListSidebarVisibilityMode',
                            !next,
                        ),
                    )
                }
                header={({sidebarToggle}) => (
                    <QueryTabs
                        items={[
                            {
                                id: 'current-query',
                                panelId,
                                type: 'query',
                                title: draft.annotations?.title || i18n('field_no-name'),
                                status: getQueryStatus(query?.state),
                                isModified: dirty,
                            },
                        ]}
                        activeTab="current-query"
                        onActiveTabChange={noop_}
                        onAddTab={handleAddQuery}
                        onCloseTab={noop_}
                        hideCloseOnLastTab
                        actions={sidebarToggle}
                    />
                )}
            >
                <div
                    id={panelId}
                    role="tabpanel"
                    aria-label={draft.annotations?.title || i18n('field_no-name')}
                    className={block('content')}
                >
                    <QueryWorkspace key={revision} onStartQuery={onStartQuery} />
                    {(loading || isQueryTrackerInfoLoading) && (
                        <div className={block('loading')}>
                            <Loader />
                        </div>
                    )}
                </div>
            </QueryPageLayout>
            <NewQueryPromt
                visible={newQueryPromptVisible}
                cancel={() => setNewQueryPromptVisible(false)}
                confirm={createQuery}
            />
        </div>
    );
}
