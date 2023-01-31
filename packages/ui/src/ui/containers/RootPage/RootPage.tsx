import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import PageHead from '../../components/PageHead/PageHead';
import {HeaderWithLinks} from '../../containers/ClustersMenu/HeaderLinks';
import {ALL_LINKS_ITEMS} from '../../containers/ClustersMenu/header-links-items';

import './RootPage.scss';

const block = cn('yt-root-page');

interface Props {
    title?: string;
    children?: React.ReactNode;
    currentPathname?: string;
}

function RootPage({title, children, currentPathname}: Props) {
    const pathname = currentPathname || window.location.pathname;
    const item = React.useMemo(() => {
        if (title) {
            return {text: title};
        }

        return _.find(ALL_LINKS_ITEMS, ({href}) => href?.startsWith(pathname));
    }, [title]);

    return (
        <React.Fragment>
            <PageHead title={item?.text || ''} />
            <HeaderWithLinks currentUrl={pathname} showTitle />
            <div className={block('content')}>
                <div className={'elements-main-section'}>{children}</div>
            </div>
        </React.Fragment>
    );
}

export default React.memo(RootPage);
