import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import includes_ from 'lodash/includes';

import hammer from '../../../../../../common/hammer';

import {getCluster} from '../../../../../../store/selectors/global';

import {MapNodeIcon} from '../../../../../../components/MapNodeIcon/MapNodeIcon';
import Link from '../../../../../../components/Link/Link';

import {WidgetFallback} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetFallback/WidgetFallback';

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

    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleItems, setVisibleItems] = useState<(string | undefined)[]>([]);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!containerRef.current) return undefined;

        const calculateVisibleItems = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (!entry) return;

            const container = containerRef.current;
            if (!container) return;

            const containerHeight = entry.contentRect.height;
            let accumulatedHeight = 0;
            const newVisible: (string | undefined)[] = [];

            for (let i = 0; i < items.length; i++) {
                const element = itemRefs.current[i];
                if (!element) continue;

                const elementHeight = element.clientHeight;
                if (accumulatedHeight + elementHeight <= containerHeight) {
                    newVisible.push(String(i));
                    accumulatedHeight += elementHeight;
                } else {
                    break;
                }
            }

            setVisibleItems(newVisible);
        };

        const resizeObserver = new ResizeObserver(calculateVisibleItems);
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [items, visibleItems.length]);

    return (
        <>
            {items.length ? (
                <Flex ref={containerRef} className={block('list')} direction={'column'}>
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            data-id={idx}
                            ref={(el: HTMLDivElement | null) => {
                                itemRefs.current[idx] = el;
                            }}
                            style={{
                                visibility: includes_(visibleItems, String(idx))
                                    ? 'visible'
                                    : 'hidden',
                            }}
                        >
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
                <WidgetFallback
                    itemsName={`${hammer.format['ReadableField'](pathsType).toLowerCase()} paths`}
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
            <Text whiteSpace={'nowrap'} ellipsis>
                <Link url={url} theme={'primary'} routed>
                    {item.path}
                </Link>
            </Text>
        </Flex>
    );
}
