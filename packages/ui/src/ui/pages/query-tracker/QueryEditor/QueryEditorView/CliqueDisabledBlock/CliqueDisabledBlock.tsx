import React, {type FC} from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import {RoutedLink} from '../../../../../containers/RoutedLink/RoutedLink';
import i18n from './i18n';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectQueryDraftCluster,
    selectQueryDraftSettings,
} from '../../../../../store/selectors/query-tracker/query';
import TriangleExclamationIcon from '@gravity-ui/icons/svgs/triangle-exclamation.svg';

export const CliqueDisabledBlock: FC = () => {
    const queryCluster = useSelector(selectQueryDraftCluster);
    const {clique} = useSelector(selectQueryDraftSettings);

    return (
        <>
            <Flex gap={1} alignItems="center">
                <Text color="danger">
                    <Icon data={TriangleExclamationIcon} size={16} />
                </Text>
                <Text>{i18n('context_clique-inactive')}</Text>
            </Flex>
            <RoutedLink href={`/${queryCluster}/chyt/${clique}`} target="_blank">
                {i18n('action_open-clique-page')}
            </RoutedLink>
        </>
    );
};
