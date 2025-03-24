import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import {getCluster} from '../../../../../../store/selectors/global';
import {makeRoutedURL} from '../../../../../../store/location';

import Icon from '../../../../../../components/Icon/Icon';
import Link from '../../../../../../components/Link/Link';

import UIFactory from '../../../../../../UIFactory';
import {getIconNameForType} from '../../../../../../utils/navigation/path-editor';

import './NavigationWidgetContent.scss';
import { Page } from '../../../../../../../shared/constants/settings';

const block = b('yt-navigation-widget-content');

const TRASH_PATH = '//tmp/trash';

type NavigationItem = {
    type: string;
    path: string;
    targetPath?: string;
};

type Props = {
    items: NavigationItem[];
};

export function NavigationWidgetContentBase(props: Props) {
    const {items} = props;

    const containerRef = useRef(null);
    const [visibleItems, setVisibleItems] = useState<(string | undefined)[]>([]);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!containerRef.current) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleItems((prevVisible) => {
                    const newVisible = [...prevVisible];

                    entries.forEach((entry) => {
                        const id = (entry.target as HTMLElement).dataset.id;
                        const isFullyVisible = entry.intersectionRatio === 1;

                        if (isFullyVisible && !newVisible.includes(id)) {
                            newVisible.push(id);
                        } else if (!isFullyVisible && newVisible.includes(id)) {
                            const index = newVisible.indexOf(id);
                            if (index !== -1) {
                                newVisible.splice(index, 1);
                            }
                        }
                    });
                    return newVisible;
                });
            },
            {
                root: containerRef.current,
                threshold: 1.0,
            },
        );

        Object.values(itemRefs.current).forEach((el) => {
            if (el instanceof Element) {
                observer.observe(el);
            }
        });
        return () => {
            observer.disconnect();
        };
    }, [items, visibleItems.length]);

    return (
        <Flex ref={containerRef} className={block('list')} direction={'column'}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    data-id={idx}
                    ref={(el: HTMLDivElement | null) => {
                        itemRefs.current[idx] = el;
                    }}
                    style={{
                        visibility: visibleItems.includes(String(idx)) ? 'visible' : 'hidden',
                    }}
                >
                    {idx !== 0 && (
                        <div style={{borderBottom: '1px solid var(--g-color-line-generic)'}}></div>
                    )}
                    <Item {...item} />
                </div>
            ))}
        </Flex>
    );
}

function Item(item: NavigationItem) {
    const cluster = useSelector(getCluster);
    return (
        //<Skeleton className={block('navigation-item')} />
        <Flex alignItems={'center'} className={block('navigation-item')}>
            <Link url={`/${cluster}/${Page.NAVIGATION}?path=${item.path}`} theme={'primary'} routed>
                <Flex direction={'row'} gap={4} alignItems={'center'}>
                    <MapNodesIcon {...item} />
                    <Text whiteSpace={'nowrap'} ellipsis>
                        {item.path}
                    </Text>
                </Flex>
            </Link>
        </Flex>
    );
}

const isTrashNode = (item: NavigationItem) => {
    return item.path === TRASH_PATH;
};

const isLinkToTrashNode = (item: NavigationItem) => {
    return item.targetPath === TRASH_PATH;
};

function MapNodesIcon(item: NavigationItem) {
    let icon = UIFactory.getNavigationMapNodeSettings()?.renderNodeIcon(item);
    if (icon) {
        // do nothing
    } else if (isTrashNode(item) || isLinkToTrashNode(item)) {
        icon = <Icon awesome="trash-alt" />;
    } else {
        icon = <Icon awesome={getIconNameForType(item.type)} />;
    }

    return icon;
}
