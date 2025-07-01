import React from 'react';
import {useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import hammer from '../../../../../../common/hammer';

import {getCluster} from '../../../../../../store/selectors/global';

import {MapNodeIcon} from '../../../../../../components/MapNodeIcon/MapNodeIcon';
import Link from '../../../../../../components/Link/Link';

import {Page} from '../../../../../../../shared/constants/settings';

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
};

export function NavigationWidgetContentBase(props: Props) {
    const {items, pathsType} = props;

    return (
        <>
            {items.length ? (
                <Flex className={block('list')} direction={'column'}>
                    {items.map((item, idx) => (
                        <div>
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
                <Text
                    variant={'body-1'}
                    color={'secondary'}
                >{`No ${`${hammer.format['ReadableField'](pathsType).toLowerCase()} paths`} found`}</Text>
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
            <Text whiteSpace={'nowrap'} ellipsis>
                <Link url={url} theme={'primary'} routed>
                    {item.path}
                </Link>
            </Text>
        </Flex>
    );
}
