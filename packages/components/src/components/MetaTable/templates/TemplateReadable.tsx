import {format as hammerFormat} from '../../../utils';

type Props = {
    value?: string;
};

export function TemplateReadable({value = hammerFormat.NO_VALUE}: Props) {
    return <span>{hammerFormat['ReadableField'](value)}</span>;
}
