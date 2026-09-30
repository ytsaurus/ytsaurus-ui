import React from 'react';
import {type RouteComponentProps, withRouter} from 'react-router';

import {computeStateQuery} from '../../utils/index';
import Link, {type LinkProps} from '../../containers/Link/Link';
import FormattedText from './FormattedText';

type RouteParams = {
    cluster?: string;
};

export type FormattedLinkProps = {
    state: {
        page: string;
        cluster?: string;
        tab?: string;
        [key: string]: unknown;
    };
    text: string | boolean | number | React.ReactElement;
    className?: string;
    asHTML?: boolean;
    title?: string;
    theme?: LinkProps['theme'];
    onClick?: LinkProps['onClick'];
};

function FormattedLink(props: FormattedLinkProps & RouteComponentProps<RouteParams>) {
    const {state, theme = 'ghost', className, text, match, onClick, ...rest} = props;
    const url = computeStateQuery({cluster: match.params.cluster, ...state});
    return (
        <Link routed url={url} theme={theme} onClick={onClick} className={className}>
            {React.isValidElement(text) ? text : <FormattedText text={text} {...rest} />}
        </Link>
    );
}
export default withRouter(FormattedLink);
