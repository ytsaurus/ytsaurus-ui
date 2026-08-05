import {Text} from '@gravity-ui/uikit';

import {ClipboardButton} from '../../ClipboardButton';

import {itemBlock} from './utils';

type Props = {
    id?: string;
};

export function TemplateId({id}: Props) {
    return (
        <div className={itemBlock('id')}>
            <Text ellipsis>{id}</Text>
            &nbsp;
            <ClipboardButton view="flat-secondary" text={id ?? ''} size="s" />
        </div>
    );
}
