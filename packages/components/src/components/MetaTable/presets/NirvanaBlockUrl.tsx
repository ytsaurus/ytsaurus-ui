import {Flex} from '@gravity-ui/uikit';

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
        <Flex maxWidth={maxWidth} overflow="hidden">
            {renderNirvanaBlockUrl({url})}
        </Flex>
    );
}
