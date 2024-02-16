import React, {FC, useCallback, useMemo} from 'react';
import Icon from '../../../../components/Icon/Icon';
import {Flex, Text} from '@gravity-ui/uikit';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import Link from '../../../../components/Link/Link';
import {makeRoutedURL} from '../../../../store/location';
import {Page} from '../../../../../shared/constants/settings';
import AttributesButton from '../../../../components/AttributesButton/AttributesButton';

export type AccountRequestData = {title: string; path: string; cluster: string; account: string};

type Props = {
    cluster: string;
    path: string;
    account: string;
    onAttributeButtonClick: (accountData: AccountRequestData) => void;
};

export const AccountActionsField: FC<Props> = ({
    path,
    account,
    cluster,
    onAttributeButtonClick,
}) => {
    const handleOpenAttributeModal = useCallback(() => {
        onAttributeButtonClick({path, account, cluster, title: path});
    }, [onAttributeButtonClick, path, account, cluster]);

    const navigationUrl = useMemo(() => {
        return makeRoutedURL(`/${cluster}/${Page.NAVIGATION}`, {path});
    }, [cluster, path]);

    if (!path) return undefined;

    return (
        <Flex gap={1} alignItems="center">
            <AttributesButton
                view="flat"
                withTooltip
                tooltipProps={{placement: 'bottom-end', content: 'Show attributes'}}
                onClick={handleOpenAttributeModal}
                size="xs"
            />
            <Link theme={'secondary'} url={navigationUrl} routed routedPreserveLocation>
                <Tooltip
                    content={<Text whiteSpace="nowrap">Open original path in Navigation</Text>}
                    placement={'left'}
                >
                    <Icon awesome={'folder-tree'} />
                </Tooltip>
            </Link>
        </Flex>
    );
};
