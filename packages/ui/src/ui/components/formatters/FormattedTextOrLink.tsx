import React from 'react';

import FormattedText, {type FormattedTextProps} from './FormattedText';
import FormattedLink, {type FormattedLinkProps} from './FormattedLink';

export type FormattedTextOrLinkProps = FormattedTextProps &
    Partial<Omit<FormattedLinkProps, keyof FormattedTextProps>> & {
        asLink?: boolean;
    };

export default function FormattedTextOrLink({asLink = false, ...props}: FormattedTextOrLinkProps) {
    const linkProps = props as FormattedLinkProps;
    return asLink ? <FormattedLink {...linkProps} /> : <FormattedText {...props} />;
}
