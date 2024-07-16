import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router';

import {computeStateQuery} from '../../utils/index';
import Link from '../../components/Link/Link';
import FormattedText from './FormattedText';

function FormattedLink(props) {
    const {state, theme = 'ghost', className, text, match, onClick, ...rest} = props;
    const url = computeStateQuery({cluster: match.params.cluster, ...state});
    return (
        <Link routed url={url} theme={theme} onClick={onClick} className={className}>
            {React.isValidElement(text) ? text : <FormattedText text={text} {...rest} />}
        </Link>
    );
}
FormattedLink.propTypes = {
    state: PropTypes.shape({
        page: PropTypes.string.isRequired,
        cluster: PropTypes.string,
        tab: PropTypes.string,
    }).isRequired,
    text: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
    className: PropTypes.string,
    theme: PropTypes.string,
    onClick: PropTypes.func,
    // from react-router
    match: PropTypes.shape({
        params: PropTypes.shape({
            cluster: PropTypes.string,
        }),
    }),
};
export default withRouter(FormattedLink);
