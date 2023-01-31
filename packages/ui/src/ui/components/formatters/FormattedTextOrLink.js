import React from 'react';
import PropTypes from 'prop-types';

import FormattedText from './FormattedText';
import FormattedLink from './FormattedLink';

export default function FormattedTextOrLink({asLink, ...props}) {
    return asLink ? <FormattedLink {...props} /> : <FormattedText {...props} />;
}
FormattedTextOrLink.propTypes = {
    asLink: PropTypes.bool,
};
FormattedTextOrLink.defaultProps = {
    asLink: false,
};
