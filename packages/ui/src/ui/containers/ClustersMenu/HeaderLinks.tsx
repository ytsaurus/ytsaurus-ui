import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';

import Link from '../../components/Link/Link';
import './ClusterMenuHeader.scss';
import {DropdownMenu} from '@gravity-ui/uikit';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import {ALL_LINKS_ITEMS, HeaderLinkItem} from './header-links-items';
import {wrapApiPromiseByToaster} from '../../utils/utils';
import {ActionD} from '../../types';

const b = block('cluster-menu');

HeaderLinks.propTypes = {
    currentUrl: PropTypes.string,
    showTitle: PropTypes.bool,
};

interface Props {
    currentUrl?: string;
    showTitle?: boolean;
}

function getItemVisibilityOrFalse(item: HeaderLinkItem) {
    if (!item.getVisible) {
        return Promise.resolve(false);
    }

    return wrapApiPromiseByToaster(item.getVisible(), {
        toasterName: 'link_item_visibility_' + item.href,
        skipSuccessToast: true,
        errorContent: <span>Cannot get visibity for {item.href}. </span>,
    })
        .then((visible) => {
            return visible;
        })
        .catch(() => {
            return false;
        });
}

interface LinksVisibilityState {
    visibilityByHref: {[href: string]: boolean};
    requestedHrefs: Set<string>;
}
const linksVisibilityState: LinksVisibilityState = {
    visibilityByHref: {},
    requestedHrefs: new Set(),
};

type LinksVisibilityAction =
    | ActionD<'add-visible-items', LinksVisibilityState['visibilityByHref']>
    | ActionD<'add-requested-hrefs', Array<string>>;

function reducer(state: LinksVisibilityState, action: LinksVisibilityAction) {
    switch (action.type) {
        case 'add-visible-items':
            return {...state, visibilityByHref: {...state.visibilityByHref, ...action.data}};
        case 'add-requested-hrefs':
            _.forEach(action.data, (href) => state.requestedHrefs.add(href));
            return {...state};
        default:
            return state;
    }
}

function useLinkItems(items: Array<HeaderLinkItem>) {
    const [{visibilityByHref, requestedHrefs}, dispatch] = React.useReducer(
        reducer,
        linksVisibilityState,
    );

    const [visible, rest] = React.useMemo(() => {
        return _.partition(items, (item) => {
            return !item.getVisible || visibilityByHref[item.href];
        });
    }, [items, visibilityByHref]);

    React.useEffect(() => {
        const toRequest = _.filter(rest, (item) => !requestedHrefs.has(item.href));

        if (!toRequest.length) {
            return;
        }

        dispatch({type: 'add-requested-hrefs', data: _.map(toRequest, (item) => item.href)});
        const collected: typeof visibilityByHref = {};
        Promise.all(
            _.map(toRequest, (item) => {
                return getItemVisibilityOrFalse(item).then((value) => {
                    collected[item.href] = value;
                });
            }),
        ).then(() => {
            dispatch({type: 'add-visible-items', data: collected});
        });
    }, [rest]);

    return visible;
}

export function HeaderLinks({currentUrl, showTitle}: Props) {
    const items = useLinkItems(ALL_LINKS_ITEMS);
    const [other, [current]] = React.useMemo(
        () => _.partition(items, ({href}) => href !== currentUrl),
        [items, currentUrl],
    );

    return (
        <React.Fragment>
            {showTitle && Boolean(current) && <div className={b('page-name')}>{current.text}</div>}
            <div className={b('links', {theme: 'expanded'})}>
                <ul className={b('links-list', block('elements-list')({type: 'unstyled'}))}>
                    {_.map(other, (link) => (
                        <li key={link.text}>
                            <Link routed={link.routed} url={link.href} className={b('links-item')}>
                                {link.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={b('links', {theme: 'collapsed'})}>
                <DropdownMenu
                    popupClassName={b('popup')}
                    switcher={
                        <Button>
                            Links&nbsp;
                            <Icon awesome={'chevron-down'} />
                        </Button>
                    }
                    items={_.map(items, (item) => {
                        return {action() {}, ...item};
                    })}
                    size={'l'}
                />
            </div>
        </React.Fragment>
    );
}

HeaderImpl.propTypes = {
    // own Props
    currentUrl: PropTypes.string,
};

function HeaderImpl({currentUrl, showTitle}: {currentUrl?: string; showTitle?: boolean}) {
    return (
        <div className={b('header', 'elements-page__header')}>
            <HeaderLinks currentUrl={currentUrl} showTitle={showTitle} />
        </div>
    );
}

export const HeaderWithLinks = React.memo(HeaderImpl);
