import {selectQuerySubmitting} from '../../../../store/selectors/query-tracker/querySubmitting';
import {useInactiveCliquePolling} from '../../hooks/useInactiveCliquePolling';
import React, {memo, useCallback, useEffect, useRef} from 'react';
import type * as monaco from 'monaco-editor';
import {useMonaco} from '../../hooks/useMonaco';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectIsQueryButtonActive,
    selectQueryEngine,
    selectQueryId,
} from '../../../../store/selectors/query-tracker/query';
import {selectIsSupportedQtACO} from '../../../../store/selectors/query-tracker/queryAco';
import {runQuery} from '../../../../store/actions/query-tracker/query';
import {Flex, Icon} from '@gravity-ui/uikit';
import Button from '../../../../components/Button/Button';
import playIcon from '../../../../assets/img/svg/play.svg';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {QueryACOSelect} from '../../QueryACO/QueryACOSelect';
import cn from 'bem-cn-lite';
import '../QueryEditorView.scss';
import {QueryEditorMonaco} from '../QueryEditorMonaco';
import i18n from './i18n';
import {CliqueDisabledBlock} from './CliqueDisabledBlock';

const b = cn('yt-qt-query-editor-view');

type Props = {
    onStartQuery?: (queryId: string) => boolean | void;
    pathNavigation?: boolean;
    hideAco?: boolean;
};

export const QueryEditorView = memo<Props>(function QueryEditorView({
    onStartQuery,
    pathNavigation,
    hideAco,
}) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const {setEditor} = useMonaco();
    const id = useSelector(selectQueryId);
    const engine = useSelector(selectQueryEngine);
    const isACOSupported = useSelector(selectIsSupportedQtACO);
    const isRunButtonActive = useSelector(selectIsQueryButtonActive);
    const dispatch = useDispatch();

    const submitting = useSelector(selectQuerySubmitting);
    const runButtonDisabled = !isRunButtonActive || submitting;

    useInactiveCliquePolling();

    const runQueryCallback = useCallback(() => {
        dispatch(runQuery(onStartQuery)).catch(() => {});
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
            if (runButtonDisabled) return;
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
    }, [runButtonDisabled, runQueryCallback]);

    const validateQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery, {execution_mode: 'validate'})).catch(() => {});
        },
        [dispatch, onStartQuery],
    );

    const explainQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery, {execution_mode: 'optimize'})).catch(() => {});
        },
        [dispatch, onStartQuery],
    );

    return (
        <div className={b()}>
            <QueryEditorMonaco pathNavigation={pathNavigation} />
            <div className={b('actions')}>
                <div className="query-run-action">
                    <Flex gap={2} alignItems="center">
                        <Button
                            actionRole="primary"
                            qa="qt-run"
                            view="action"
                            disabled={runButtonDisabled}
                            onClick={runQueryCallback}
                        >
                            <Icon data={playIcon} />
                            {i18n('action_run')}
                        </Button>

                        {!isRunButtonActive && <CliqueDisabledBlock />}
                    </Flex>

                    {!runButtonDisabled && (
                        <>
                            {engine === QueryEngine.YQL ? (
                                <>
                                    <Button
                                        qa="qt-validate"
                                        view="normal"
                                        onClick={validateQueryCallback}
                                    >
                                        {i18n('action_validate')}
                                    </Button>
                                    <Button
                                        qa="qt-explain"
                                        view="normal"
                                        onClick={explainQueryCallback}
                                    >
                                        {i18n('action_explain')}
                                    </Button>
                                </>
                            ) : null}
                            {isACOSupported && !hideAco && <QueryACOSelect />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});
