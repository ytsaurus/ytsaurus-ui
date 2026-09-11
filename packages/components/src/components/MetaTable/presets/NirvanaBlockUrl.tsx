import {Flex} from '@gravity-ui/uikit';

import {ClipboardButton} from '../../ClipboardButton';
import type {MetaTableNirvanaBlockUrlRenderer} from '../../../types';
import {TemplateLink} from '../templates/TemplateLink';

type Props = {
    url: string;
    maxWidth?: string | number;
    renderNirvanaBlockUrl?: MetaTableNirvanaBlockUrlRenderer;
};

export function NirvanaBlockUrl({url, maxWidth, renderNirvanaBlockUrl}: Props) {
    if (!renderNirvanaBlockUrl) {
        return <TemplateLink url={url} text={url} maxWidth={maxWidth} withClipboard />;
    }

    return (
        <Flex gap={1} wrap="nowrap" alignItems="center" style={{maxWidth}}>
            {renderNirvanaBlockUrl({text: url})}

            <ClipboardButton view="flat-secondary" text={url} size="s" />
        </Flex>
    );
}
