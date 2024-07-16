import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import unipika from '../../common/thor/unipika';
import Label from '../Label/Label';
import {showErrorPopup} from '../../utils/utils';

const block = cn('elements-text');

function prepareTextProps(text, asHTML) {
    const props = {};

    if (text !== undefined) {
        if (asHTML) {
            // Need to render html strings
            props.dangerouslySetInnerHTML = {__html: text};
        } else {
            try {
                props.children = unipika.decode(String(text));
            } catch (e) {
                console.error('Text cannot be decoded:', text, e);
                props.children = (
                    <span>
                        {text}
                        <span
                            onClick={() =>
                                showErrorPopup({
                                    message: `Text cannot be decoded so it is displayed as is`,
                                    inner_errors: [e],
                                })
                            }
                        >
                            <Label theme={'warning'} text={'Decoding error'} />
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
    title = text,
}) {
    const className = mixedClassName ? block(false, mixedClassName) : block();
    const textProps = prepareTextProps(text, asHTML);

    return <span {...textProps} title={title} className={className} />;
}
FormattedText.propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    className: PropTypes.string,
    asHTML: PropTypes.bool,
    title: PropTypes.string,
};
