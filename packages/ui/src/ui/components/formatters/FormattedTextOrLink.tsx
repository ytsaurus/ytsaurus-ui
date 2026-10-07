import React from 'react';

import FormattedText, {type FormattedTextProps} from './FormattedText';
import FormattedLink, {type FormattedLinkProps} from './FormattedLink';

type TextOnlyProps = FormattedTextProps &
    Partial<Omit<FormattedLinkProps, keyof FormattedTextProps>> & {asLink?: false};

type TextOrLinkProps = FormattedTextProps &
    Pick<FormattedLinkProps, 'state'> &
    Partial<Omit<FormattedLinkProps, keyof FormattedTextProps | 'state'>> & {
        text: NonNullable<FormattedTextProps['text']>;
        asLink: boolean;
    };

export type FormattedTextOrLinkProps = TextOnlyProps | TextOrLinkProps;

export default function FormattedTextOrLink(props: FormattedTextOrLinkProps) {
    return props.asLink ? <FormattedLink {...props} /> : <FormattedText {...props} />;
}
