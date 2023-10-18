import React from 'react';
import PropTypes from 'prop-types';
import {Link} from '@gravity-ui/uikit';
import {uiSettings} from '../../config/ui-settings';

const {trackerBaseUrl} = uiSettings;

const HREF_RE = /(https?:\/\/\S+[^?.,!\s]|\[A-Z\]{2,}-\d+)/;
const STARTREK_KEY_RE = /^[A-Z]{2,}-\d+$/;

const getUrl = (text: string) => {
    if (trackerBaseUrl && STARTREK_KEY_RE.test(text)) {
        return `${trackerBaseUrl}/${text}`;
    }
    return text;
};

interface Props {
    className?: string;
    text: string;
}

export class Linkify extends React.PureComponent<Props> {
    static propTypes = {
        className: PropTypes.string,
        text: PropTypes.string.isRequired,
    };

    static renderText(text = '', re: RegExp) {
        const parts = String(text).split(re);
        const res: Array<React.ReactNode> = parts.slice();
        for (let i = 1; i < parts.length; i += 2) {
            const url = getUrl(parts[i]);
            res[i] = (
                <Link key={i} target="_blank" href={url}>
                    {parts[i]}
                </Link>
            );
        }
        return res;
    }

    render() {
        const {text, className} = this.props;
        return <span className={className}>{Linkify.renderText(text, HREF_RE)}</span>;
    }
}
