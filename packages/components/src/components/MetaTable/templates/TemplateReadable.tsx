import {format as hammerFormat} from '../../../utils';

import {metaTableItemBlock} from '../utils';

type Props = {
    value?: string;
};

export function TemplateReadable({value = hammerFormat.NO_VALUE}: Props) {
    return (
        <span className={metaTableItemBlock('readable')}>
            {hammerFormat['ReadableField'](value)}
        </span>
    );
}
