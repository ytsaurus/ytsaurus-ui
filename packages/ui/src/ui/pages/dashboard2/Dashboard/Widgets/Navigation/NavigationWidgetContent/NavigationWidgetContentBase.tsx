import React from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';
import b from 'bem-cn-lite';
import {AxiosError} from 'axios';
import {Flex} from '@gravity-ui/uikit';

import {getCluster} from '../../../../../../store/selectors/global';

import {WidgetText} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';
import {WidgetNoItemsTextFallback} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetFallback/WidgetFallback';

import {MapNodeIcon} from '../../../../../../components/MapNodeIcon/MapNodeIcon';
import {YTErrorBlock} from '../../../../../../components/Error/Error';
import Link from '../../../../../../components/Link/Link';

import {Page} from '../../../../../../../shared/constants/settings';
import {YTError} from '../../../../../../../@types/types';

import i18n from '../i18n';

import './NavigationWidgetContent.scss';

const block = b('yt-navigation-widget-content');

type NavigationItem = {
    type: string;
    path: string;
    targetPath?: string;
    attributes?: Record<string, unknown>;
};

type Props = {
    items: NavigationItem[];
    pathsType: 'last_visited' | 'favourite';
    error?: unknown;
};

export function NavigationWidgetContentBase(props: Props) {
    const {items, pathsType, error} = props;

    if (error) {
        return (
            <YTErrorBlock
                view={'compact'}
                error={error as YTError | AxiosError}
                className={block('error')}
            />
        );
    }

    return (
        <>
            {items.length ? (
                <Flex className={block('list')} direction={'column'}>
                    {items.map((item, idx) => (
                        <div key={item?.path}>
                            {idx !== 0 && (
                                <div
                                    style={{borderBottom: '1px solid var(--g-color-line-generic)'}}
                                ></div>
                            )}
                            <Item {...item} />
                        </div>
                    ))}
                </Flex>
            ) : (
                <WidgetNoItemsTextFallback
                    itemsName={i18n(
                        `fallback-item_${pathsType === 'last_visited' ? 'last-visited' : 'favourite'}`,
                    )}
                />
            )}
        </>
    );
}

function Item(item: NavigationItem) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.NAVIGATION}?path=${item.path}`;

    return (
        <Flex direction={'row'} gap={4} alignItems={'center'} className={block('navigation-item')}>
            <MapNodeIcon node={{$attributes: item?.attributes}} />
            <WidgetText>
                <Link url={url} theme={'primary'} routed>
                    {item.path}
                </Link>
            </WidgetText>
        </Flex>
    );
}
