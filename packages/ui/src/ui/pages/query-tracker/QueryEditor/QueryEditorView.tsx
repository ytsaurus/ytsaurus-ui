import React, {memo, useCallback, useEffect, useRef} from 'react';
import * as monaco from 'monaco-editor';
import {useMonaco} from '../hooks/useMonaco';
import {useDispatch, useSelector} from 'react-redux';
import {getQueryEngine, getQueryId} from '../../../store/selectors/query-tracker/query';
import {isSupportedQtACO} from '../../../store/selectors/query-tracker/queryAco';
import {runQuery} from '../../../store/actions/query-tracker/query';
import {Button, Icon} from '@gravity-ui/uikit';
import playIcon from '../../../assets/img/svg/play.svg';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryACOSelect} from '../QueryACO/QueryACOSelect';
import cn from 'bem-cn-lite';
import './QueryEditorView.scss';
import {QueryEditorMonaco} from './QueryEditorMonaco';

const b = cn('yt-qt-query-editor-view');

type Props = {
    onStartQuery?: (queryId: string) => boolean | void;
    pathNavigation?: boolean;
};

export const QueryEditorView = memo<Props>(function QueryEditorView({
    onStartQuery,
    pathNavigation,
}) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const {setEditor} = useMonaco();
    const id = useSelector(getQueryId);
    const engine = useSelector(getQueryEngine);
    const isACOSupported = useSelector(isSupportedQtACO);
    const dispatch = useDispatch();

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
    }, [runQueryCallback]);

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
                    <Button qa="qt-run" view="action" onClick={runQueryCallback}>
                        <Icon data={playIcon} />
                        Run
                    </Button>
                    {engine === QueryEngine.YQL ? (
                        <>
                            <Button qa="qt-validate" onClick={validateQueryCallback}>
                                Validate
                            </Button>
                            <Button qa="qt-explain" onClick={explainQueryCallback}>
                                Explain
                            </Button>
                        </>
                    ) : null}
                    {isACOSupported && <QueryACOSelect />}
                </div>
            </div>
        </div>
    );
});
