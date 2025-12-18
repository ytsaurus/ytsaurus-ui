import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as monaco from 'monaco-editor';
import {useMonaco} from '../hooks/useMonaco';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    getQueryDraftCluster,
    getQueryEditorErrors,
    getQueryEngine,
    getQueryId,
    getQueryText,
    isQueryLoading,
} from '../../../store/selectors/query-tracker/query';
import {useMonacoQuerySuggestions} from '../querySuggestionsModule/useMonacoQuerySuggestions';
import {updateQueryDraft} from '../../../store/actions/query-tracker/query';
import {getHashLineNumber} from './helpers/getHashLineNumber';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor';
import {WaitForFont} from '../../../containers/WaitForFont/WaitForFont';
import cn from 'bem-cn-lite';
import {getLanguageByEngine} from './helpers/getLanguageByEngine';
import './QueryEditorMonaco.scss';
import {LinkDecorator} from './decorators/LinkDecorator';
import {LineDecoration} from './decorators/LineDecoration';
import {ErrorDecorator} from './decorators/ErrorDecorator';
import {getMonacoConfig} from './getMonacoConfig';
import {checkControlCommandKey, getControlCommandKey} from '../../../utils/keyboard';
import {openPath} from '../../../store/actions/query-tracker/queryNavigation';

const b = cn('yq-query-editor-monaco');

type Decorators =
    | {isInitialized: false; linkDecorator: null; lineDecorator: null; errorDecorator: null}
    | {
          isInitialized: true;
          linkDecorator: LinkDecorator | null;
          lineDecorator: LineDecoration;
          errorDecorator: ErrorDecorator;
      };

type Props = {
    pathNavigation?: boolean;
};

export const QueryEditorMonaco: FC<Props> = ({pathNavigation = true}) => {
    const [changed, setChanged] = useState(false);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const {setEditor} = useMonaco();
    const id = useSelector(getQueryId);
    const text = useSelector(getQueryText);
    const cluster = useSelector(getQueryDraftCluster);
    const engine = useSelector(getQueryEngine);
    const editorErrors = useSelector(getQueryEditorErrors);
    const loading = useSelector(isQueryLoading);
    const dispatch = useDispatch();

    const decorators = useRef<Decorators>({
        isInitialized: false,
        linkDecorator: null,
        lineDecorator: null,
        errorDecorator: null,
    });
    useMonacoQuerySuggestions(editorRef.current);

    useEffect(() => {
        editorRef.current?.focus();
        editorRef.current?.setScrollTop(0);
    }, [id]);

    useEffect(() => {
        if (editorRef.current) {
            setEditor('queryEditor', editorRef.current);

            if (!decorators.current.isInitialized) {
                decorators.current = {
                    isInitialized: true,
                    linkDecorator: pathNavigation
                        ? new LinkDecorator(editorRef.current, engine, getControlCommandKey())
                        : null,
                    lineDecorator: new LineDecoration(editorRef.current),
                    errorDecorator: new ErrorDecorator(editorRef.current),
                };
            }
        }
    }, [setEditor]);

    useEffect(() => {
        decorators.current.linkDecorator?.updateLinks();
    }, [text, cluster]);

    useEffect(() => {
        decorators.current.linkDecorator?.setEngine(engine);
    }, [engine]);

    useEffect(() => {
        decorators.current.errorDecorator?.setErrors(editorErrors, b('error-line'));

        const lineNumber = getHashLineNumber();
        if (!loading && lineNumber && !changed) {
            decorators.current.lineDecorator?.setActiveLine(lineNumber);
            editorRef.current?.revealLineInCenter(lineNumber);
        }
    }, [changed, editorErrors, loading]);

    const monacoConfig = useMemo<MonacoEditorConfig>(() => {
        return getMonacoConfig(engine);
    }, [engine]);

    const lineNumberClick = useCallback((target: monaco.editor.IEditorMouseEvent['target']) => {
        const lineNumber = (target.element as HTMLDivElement).dataset.number;
        if (lineNumber) {
            decorators.current.lineDecorator?.setActiveLine(parseInt(lineNumber, 10));

            const newUrl = new URL(window.location.href);
            newUrl.hash = `#L${lineNumber}`;
            window.history.pushState(null, '', newUrl.toString());
        } else {
            decorators.current.lineDecorator?.clearLines();
        }
    }, []);

    const pathClick = useCallback(
        (position: monaco.Position) => {
            const link = decorators.current.linkDecorator?.findLink(position);
            if (!link) return;
            dispatch(openPath(link.path, link.cluster));
        },
        [dispatch],
    );

    const handleOnClick = useCallback(
        ({target, event}: monaco.editor.IEditorMouseEvent) => {
            if (target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
                lineNumberClick(target);
            }
            if (
                target.type === monaco.editor.MouseTargetType.CONTENT_TEXT &&
                checkControlCommandKey(event)
            ) {
                pathClick(target.position);
            }
        },
        [lineNumberClick, pathClick],
    );

    const updateQueryText = useCallback(
        (query: string) => {
            setChanged(true);
            dispatch(updateQueryDraft({query, error: undefined}));
        },
        [dispatch],
    );

    return (
        <WaitForFont>
            <MonacoEditor
                editorRef={editorRef}
                value={text || ''}
                language={getLanguageByEngine(engine)}
                className={b()}
                onChange={updateQueryText}
                onClick={handleOnClick}
                monacoConfig={monacoConfig}
            />
        </WaitForFont>
    );
};
