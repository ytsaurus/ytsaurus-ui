import React from 'react';
import {Alert, Flex} from '@gravity-ui/uikit';

import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global';
import {selectAttributesPath, selectPath} from '../../../../store/selectors/navigation';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import i18n from './i18n';

export const RealPathNotice = () => {
    const path = useSelector(selectPath);
    const realPath = useSelector(selectAttributesPath);
    const cluster = useSelector(selectCluster);

    if (path === realPath) {
        return null;
    }

    return (
        <Alert
            theme="info"
            align="center"
            message={
                <Flex gap={1} wrap="nowrap">
                    {i18n('context_real-path')}
                    <RoutedLink href={genNavigationUrl({cluster, path: realPath})}>
                        {realPath}
                    </RoutedLink>
                </Flex>
            }
        />
    );
};
