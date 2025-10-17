import {useCallback, useEffect} from 'react';
import * as monaco from 'monaco-editor';
import {useSelector} from '../../../store/redux-hooks';
import {getQuerySuggestionsEnabled} from '../../../store/selectors/settings/settings-queries';
import UIFactory from '../../../UIFactory';

export const useMonacoQuerySuggestions = (editor?: monaco.editor.IStandaloneCodeEditor) => {
    const enabled = useSelector(getQuerySuggestionsEnabled);

    useEffect(() => {
        UIFactory.getInlineSuggestionsApi()?.sendTelemetry(enabled ? 'enabled' : 'disabled');
    }, [enabled]);

    const handleCancelTelemetry = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && editor && enabled) {
                UIFactory.getInlineSuggestionsApi()?.sendTelemetry('discarded');
            }
        },
        [editor],
    );

    useEffect(() => {
        monaco.editor.registerCommand('accessQuerySuggestionsTelemetry', async () => {
            UIFactory.getInlineSuggestionsApi()?.sendTelemetry('accepted');
        });
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleCancelTelemetry, true);

        return () => {
            document.removeEventListener('keydown', handleCancelTelemetry, true);
        };
    }, [handleCancelTelemetry, editor]);
};
