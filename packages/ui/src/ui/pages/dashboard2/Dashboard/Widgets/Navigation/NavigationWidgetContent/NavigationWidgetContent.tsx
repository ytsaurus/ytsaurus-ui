import React, {useEffect, useRef, useState} from 'react';
import b from 'bem-cn-lite';
import {Flex, Link, List, Text} from '@gravity-ui/uikit';

import UIFactory from '../../../../../../UIFactory';
import {getIconNameForType} from '../../../../../../utils/navigation/path-editor';
import Icon from '../../../../../../components/Icon/Icon';

import './NavigationWidgetContent.scss';

const block = b('yt-navigation-widget-content');

const TRASH_PATH = '//tmp/trash';

const items: NavigationItem[] = [
    {path: '//', iconType: 'map_node', type: 'map_node'},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {
        path: '//home/yt-interface/autushka/autushka/tables/static_table',
        iconType: 'table',
        type: 'map_node',
    },
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
    {path: '//home/yt-interface', iconType: 'link', type: 'map_node', targetPath: TRASH_PATH},
];

type NavigationItem = {
    type: string;
    path: string;
    targetPath?: string;
    iconType: string;
    targetPathBroken?: string;
};

export function NavigationWidgetContent() {
    const containerRef = useRef(null);
    const [visibleItems, setVisibleItems] = useState([]);
    const itemRefs = useRef({});

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleItems((prevVisible) => {
                    const newVisible = [...prevVisible];

                    entries.forEach((entry) => {
                        const id = entry.target.dataset.id;
                        const isFullyVisible = entry.intersectionRatio === 1;

                        if (isFullyVisible && !newVisible.includes(id)) {
                            newVisible.push(id);
                        } else if (!isFullyVisible && newVisible.includes(id)) {
                            const index = newVisible.indexOf(id);
                            newVisible.splice(index, 1);
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
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [items, visibleItems.length]);

    return (
        <Flex ref={containerRef} className={block('list')} direction={'column'}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    data-id={idx}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    style={{
                        visibility: visibleItems.includes(String(idx)) ? 'visible' : 'hidden',
                    }}
                >
                    <Item {...item} />
                </div>
            ))}
        </Flex>
    );
}

function Item(item: NavigationItem) {
    return (
        //<Skeleton className={block('navigation-item')} />
        <Flex alignItems={'center'} className={block('navigation-item')}>
            <Link href={''} view={'primary'} className={block('link')}>
                <Flex direction={'row'} gap={4}>
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
        icon = <Icon awesome={getIconNameForType(item.iconType, item.targetPathBroken)} />;
    }

    return (
        <span className={'icon-wrapper'} title={item.type}>
            {icon}
        </span>
    );
}
