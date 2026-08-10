import {Flex, Text} from '@gravity-ui/uikit';

import {ClipboardButton} from '../../ClipboardButton';

import {metaTableItemBlock} from '../utils';

type Props = {
    id: string;
};

export function TemplateId({id}: Props) {
    return (
        <Flex gap={1} wrap="nowrap" alignItems="center" className={metaTableItemBlock('id')}>
            <Text ellipsis>{id}</Text>
            <ClipboardButton view="flat-secondary" text={id} size="s" />
        </Flex>
    );
}
