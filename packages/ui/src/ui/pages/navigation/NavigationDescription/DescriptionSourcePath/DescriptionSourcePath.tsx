import React from 'react';
import {CircleQuestion} from '@gravity-ui/icons';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import {ClipboardButton, Label, MetaTable, Tooltip} from '@ytsaurus/components';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {makeNavigationLink} from '../../../../utils/app-url';
import i18n from '../NavigationDescriptionToolbar/i18n';

export function DescriptionSourcePath({path, cluster}: {path: string; cluster?: string}) {
    const url = makeNavigationLink({path, cluster});

    return (
        <Tooltip
            content={
                <MetaTable
                    legacyGroupSpacing
                    alignItems="baseline"
                    items={[
                        {
                            key: 'source-path',
                            label: i18n('field_source-path'),
                            value: (
                                <Flex alignItems="baseline" overflow="hidden" gap={1}>
                                    <Text ellipsis>
                                        <RoutedLink view="secondary" href={url}>
                                            {path}
                                        </RoutedLink>
                                    </Text>

                                    <ClipboardButton view="flat-secondary" text={path} />
                                </Flex>
                            ),
                        },
                    ]}
                />
            }
        >
            <Label>
                <Flex alignItems={'center'} gap={1}>
                    <RoutedLink view="secondary" href={url}>
                        {i18n('value_inherited')}
                    </RoutedLink>

                    <Icon data={CircleQuestion} size={14} style={{marginBottom: '-2px'}} />
                </Flex>
            </Label>
        </Tooltip>
    );
}
