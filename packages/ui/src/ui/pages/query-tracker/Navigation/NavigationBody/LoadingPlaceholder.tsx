import React, {FC} from 'react';
import {Flex, Loader} from '@gravity-ui/uikit';

export const LoadingPlaceholder: FC = () => {
    return (
        <Flex alignItems="center" justifyContent="center">
            <Loader />
        </Flex>
    );
};
