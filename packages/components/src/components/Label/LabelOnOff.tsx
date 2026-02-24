import {Label} from './Label';
import {format} from '../../utils/hammer';

export function LabelOnOff({value, className}: {value?: boolean; className?: string}) {
    if (value === undefined) {
        return format.NO_VALUE;
    }
    const theme = value ? 'success' : 'danger';
    const text = value ? 'On' : 'Off';
    return <Label theme={theme} text={text} className={className} />;
}
