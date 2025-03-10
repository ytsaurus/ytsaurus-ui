import {UnipikaSettings} from '../components/Yson/StructuredYson/StructuredYsonTypes';
import unipika from '../common/thor/unipika';

export function prettyPrint(value: unknown, settings: UnipikaSettings) {
    const content =
        settings.format === 'raw-json'
            ? unipika.formatRaw(value, settings)
            : unipika.formatFromYSON(value, settings);

    return settings.asHTML ? '<pre class="unipika">' + content + '</pre>' : content;
}
