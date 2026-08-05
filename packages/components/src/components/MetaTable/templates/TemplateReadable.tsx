import {format as hammerFormat} from '../../../utils';

import {itemBlock} from './utils';

type Props = {
    value?: string;
};

export function TemplateReadable({value = hammerFormat.NO_VALUE}: Props) {
    return <span className={itemBlock('readable')}>{hammerFormat['ReadableField'](value)}</span>;
}
