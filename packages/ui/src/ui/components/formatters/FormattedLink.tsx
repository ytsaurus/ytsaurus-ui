import React from 'react';
import {type RouteComponentProps, withRouter} from 'react-router';

import {computeStateQuery} from '../../utils/index';
import Link, {type LinkProps} from '../../containers/Link/Link';
import FormattedText, {type FormattedTextProps} from './FormattedText';

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
    className?: string;
    title?: string;
    theme?: LinkProps['theme'];
    onClick?: LinkProps['onClick'];
} & (
    | {text: React.ReactElement; asHTML?: boolean}
    | (FormattedTextProps & {text: NonNullable<FormattedTextProps['text']>})
);

function FormattedLink(props: FormattedLinkProps & RouteComponentProps<RouteParams>) {
    const {state, theme = 'ghost', className, text, match, onClick, ...rest} = props;
    const url = computeStateQuery({cluster: match.params.cluster, ...state});
    const renderText = () => {
        if (React.isValidElement<React.ReactElement['props']>(props.text)) {
            return text;
        }
        return props.asHTML ? (
            <FormattedText {...rest} text={props.text} asHTML />
        ) : (
            <FormattedText {...rest} text={props.text} asHTML={props.asHTML} />
        );
    };
    return (
        <Link routed url={url} theme={theme} onClick={onClick} className={className}>
            {renderText()}
        </Link>
    );
}
export default withRouter(FormattedLink);
