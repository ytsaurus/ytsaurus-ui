import React, {memo, useCallback, useEffect, useRef} from 'react';
import type * as monaco from 'monaco-editor';
import {useMonaco} from '../../hooks/useMonaco';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectIsQueryButtonActive,
    selectQueryDraftCluster,
    selectQueryEngine,
    selectQueryId,
    selectShouldPollCliqueWhenInactive,
} from '../../../../store/selectors/query-tracker/query';
import {selectIsSupportedQtACO} from '../../../../store/selectors/query-tracker/queryAco';
import {loadCliqueByCluster, runQuery} from '../../../../store/actions/query-tracker/query';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import playIcon from '../../../../assets/img/svg/play.svg';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {QueryACOSelect} from '../../QueryACO/QueryACOSelect';
import cn from 'bem-cn-lite';
import '../QueryEditorView.scss';
import {QueryEditorMonaco} from '../QueryEditorMonaco';
import i18n from './i18n';
import TriangleExclamationIcon from '@gravity-ui/icons/svgs/triangle-exclamation.svg';

const b = cn('yt-qt-query-editor-view');

type Props = {
    onStartQuery?: (queryId: string) => boolean | void;
    pathNavigation?: boolean;
};

const INACTIVE_CLIQUE_REFRESH_INTERVAL = 5000;

export const QueryEditorView = memo<Props>(function QueryEditorView({
    onStartQuery,
    pathNavigation,
}) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const {setEditor} = useMonaco();
    const id = useSelector(selectQueryId);
    const engine = useSelector(selectQueryEngine);
    const queryCluster = useSelector(selectQueryDraftCluster);
    const shouldPollClique = useSelector(selectShouldPollCliqueWhenInactive);
    const isACOSupported = useSelector(selectIsSupportedQtACO);
    const isRunButtonActive = useSelector(selectIsQueryButtonActive);
    const dispatch = useDispatch();

    const runButtonDisabled = !isRunButtonActive;

    useEffect(() => {
        if (!shouldPollClique || !queryCluster) return;
        const intervalId = setInterval(() => {
            dispatch(loadCliqueByCluster(QueryEngine.CHYT, queryCluster));
        }, INACTIVE_CLIQUE_REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [dispatch, shouldPollClique, queryCluster]);

    const runQueryCallback = useCallback(() => {
        dispatch(runQuery(onStartQuery));
    }, [dispatch, onStartQuery]);

    useEffect(() => {
        editorRef.current?.focus();
        editorRef.current?.setScrollTop(0);
    }, [id]);

    useEffect(() => {
        if (editorRef.current) {
            setEditor('queryEditor', editorRef.current);
        }
    }, [setEditor]);

    useEffect(() => {
        const runQueryByKey = (e: KeyboardEvent) => {
            if (!isRunButtonActive) return;
            const isCtrlOrMetaPressed = e.ctrlKey || e.metaKey;
            const isEnterOrEKeyPressed = e.key === 'Enter' || e.key === 'e';
            const isF8KeyPressed = e.key === 'F8';

            if ((isCtrlOrMetaPressed && isEnterOrEKeyPressed) || isF8KeyPressed) {
                e.preventDefault();
                e.stopPropagation();
                runQueryCallback();
            }
        };

        document.addEventListener('keydown', runQueryByKey, true);
        return () => {
            document.removeEventListener('keydown', runQueryByKey, true);
        };
    }, [isRunButtonActive, runQueryCallback]);

    const validateQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery, {execution_mode: 'validate'}));
        },
        [dispatch, onStartQuery],
    );

    const explainQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery, {execution_mode: 'optimize'}));
        },
        [dispatch, onStartQuery],
    );

    return (
        <div className={b()}>
            <QueryEditorMonaco pathNavigation={pathNavigation} />
            <div className={b('actions')}>
                <div className="query-run-action">
                    <Flex gap={1} alignItems="center">
                        <Button
                            qa="qt-run"
                            view="action"
                            disabled={runButtonDisabled}
                            onClick={runQueryCallback}
                        >
                            <Icon data={playIcon} />
                            {i18n('action_run')}
                        </Button>

                        {runButtonDisabled && (
                            <>
                                <Text color="danger">
                                    <Icon data={TriangleExclamationIcon} size={16} />
                                </Text>
                                <span>{i18n('tooltip_clique_inactive')}</span>
                            </>
                        )}
                    </Flex>

                    {isRunButtonActive && (
                        <>
                            {engine === QueryEngine.YQL ? (
                                <>
                                    <Button qa="qt-validate" onClick={validateQueryCallback}>
                                        {i18n('action_validate')}
                                    </Button>
                                    <Button qa="qt-explain" onClick={explainQueryCallback}>
                                        {i18n('action_explain')}
                                    </Button>
                                </>
                            ) : null}
                            {isACOSupported && <QueryACOSelect />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});
