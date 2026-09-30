import React from 'react';
import cn from 'bem-cn-lite';

import {type YTError} from '../../../@types/types';
import unipika from '../../common/thor/unipika';
import Label from '../Label';
import {showErrorPopup} from '../../utils/utils';
import i18n from './i18n';

const block = cn('elements-text');

export type FormattedTextProps = {
    text?: string | boolean | number;
    className?: string;
    asHTML?: boolean;
    title?: string;
};

function prepareTextProps(
    text: FormattedTextProps['text'],
    asHTML: boolean,
): Pick<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'dangerouslySetInnerHTML'> {
    const props: Pick<
        React.HTMLAttributes<HTMLSpanElement>,
        'children' | 'dangerouslySetInnerHTML'
    > = {};

    if (text !== undefined) {
        if (asHTML) {
            // Need to render html strings
            props.dangerouslySetInnerHTML = {__html: text as string};
        } else {
            try {
                props.children = unipika.decode(String(text));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Text cannot be decoded:', text, e);
                props.children = (
                    <span>
                        {text}
                        <span
                            onClick={() =>
                                showErrorPopup({
                                    message: i18n('alert_text-cannot-be-decoded'),
                                    inner_errors: [e as YTError],
                                })
                            }
                        >
                            <Label theme={'warning'} text={i18n('alert_decoding-error')} />
                        </span>
                    </span>
                );
            }
        }
    }

    return props;
}

export default function FormattedText({
    text,
    className: mixedClassName,
    asHTML = false,
    title = text as string | undefined,
}: FormattedTextProps) {
    const className = mixedClassName ? block(null, mixedClassName) : block();
    const textProps = prepareTextProps(text, asHTML);

    return <span {...textProps} title={title} className={className} />;
}
