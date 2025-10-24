import React from 'react';
import cn from 'bem-cn-lite';
import {Flex, Icon} from '@gravity-ui/uikit';
import checkSvg from '@gravity-ui/icons/svgs/circle-check.svg';
import xMarkSvg from '@gravity-ui/icons/svgs/circle-xmark.svg';

import format from '../../../common/hammer/format';

import {ACLReduxProps} from '../ACL-connect-helpers';

import './MyPermissions.scss';
import {useAvailablePermissions} from '../hooks/use-available-permissions';

const block = cn('yt-my-permissions');

export function MyPermissions({
    idmKind,
    path,
    userPermissions,
    className,
}: Pick<ACLReduxProps, 'userPermissions' | 'idmKind' | 'path'> & {className?: string}) {
    const {permissionsToCheck} = useAvailablePermissions({idmKind, path});

    const visibleUserPermissions = React.useMemo(() => {
        const visible = new Set(permissionsToCheck);
        return userPermissions.filter(({type}) => {
            return visible.has(type);
        });
    }, [userPermissions, permissionsToCheck]);

    if (!permissionsToCheck.length) {
        return null;
    }

    const groups: Array<typeof visibleUserPermissions> = [];
    for (let i = 0; i < visibleUserPermissions?.length; i += 4) {
        groups.push(visibleUserPermissions.slice(i, i + 4));
    }
    return (
        <Flex className={block(null, className)}>
            {groups.map((items, index) => {
                return <PermissionsGroup items={items} key={index} />;
            })}
        </Flex>
    );
}

function PermissionsGroup({items}: {items: ACLReduxProps['userPermissions']}) {
    return (
        <Flex className={block('group')} direction="column" gap={1}>
            {items.map(({type, action}) => {
                return (
                    <Flex
                        className={block('item', {type: action})}
                        key={type}
                        alignItems={'center'}
                        gap={1}
                    >
                        <Icon
                            size={16}
                            className={block('icon', {
                                color: action === 'deny' ? 'danger' : 'success',
                            })}
                            data={action === 'deny' ? xMarkSvg : checkSvg}
                        />
                        {format.Readable(type)}
                    </Flex>
                );
            })}
        </Flex>
    );
}
