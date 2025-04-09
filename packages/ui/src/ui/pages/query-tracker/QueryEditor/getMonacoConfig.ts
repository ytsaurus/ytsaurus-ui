import {QueryEngine} from '../../../../shared/constants/engines';
import {MonacoEditorConfig} from '../../../components/MonacoEditor';

export const getMonacoConfig = (engine: QueryEngine): MonacoEditorConfig => {
    return {
        fontSize: 14,
        language: engine,
        renderWhitespace: 'boundary',
        minimap: {
            enabled: true,
        },
        inlineSuggest: {
            enabled: true,
            showToolbar: 'always',
            mode: 'subword',
            keepOnBlur: true,
        },
    };
};
