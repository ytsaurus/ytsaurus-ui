import {UnipikaSettings} from '../components/Yson/StructuredYson/StructuredYsonTypes';
import unipika from '../common/thor/unipika';

export const YSON_AS_TEXT = (): UnipikaSettings => ({
    format: 'yson',
    asHTML: false,
    indent: 0,
    break: false,
});

export function prettyPrint(value: unknown, settings: UnipikaSettings) {
    const content =
        settings.format === 'raw-json'
            ? unipika.formatRaw(value, settings)
            : unipika.formatFromYSON(value, settings);

    return settings.asHTML ? '<pre class="unipika">' + content + '</pre>' : content;
}
