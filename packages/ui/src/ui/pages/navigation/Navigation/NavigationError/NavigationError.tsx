import React from 'react';
import cn from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import Error from '../../../../components/Error/Error';
import NavigationErrorImage from './NavigationErrorImage';
import ErrorDetails from '../../../../components/ErrorDetails/ErrorDetails';
import RequestPermission from './RequestPermission';
import {ErrorName, ErrorType, getErrorTitle} from './helpers';

import './NavigationError.scss';

const cnNavigationError = cn('navigation-error');

type Props = {
    path?: string;
    type: ErrorName;
    details: ErrorType;
    cluster: string;
    message: string;
};

function CommonError(props: Props) {
    const {type, details, path, cluster} = props;

    const title = getErrorTitle(type, details, path);

    return (
        <Flex className={cnNavigationError()} justifyContent="center" alignItems="center" gap={7}>
            <Flex>
                <NavigationErrorImage type={type} />
            </Flex>
            <Flex direction="column" className={cnNavigationError('info')} gap={4}>
                <Text className={cnNavigationError('title')}>{title}</Text>
                <ErrorDetails error={details} />
                {type === 'ACCESS_DENIED' && (
                    <RequestPermission
                        cluster={cluster}
                        path={path}
                        error={details}
                        block={cnNavigationError}
                    />
                )}
            </Flex>
        </Flex>
    );
}

function UnexpectedError(props: Props) {
    const {details, message} = props;

    return (
        <Error
            className={cnNavigationError('unexpected-error')}
            error={details}
            message={message}
        />
    );
}

function NavigationError(props: Props) {
    const {type} = props;

    return (
        <>
            {['ACCESS_DENIED', 'INCORRECT_PATH'].includes(type) ? (
                <CommonError {...props} />
            ) : (
                <UnexpectedError {...props} />
            )}
        </>
    );
}

export default NavigationError;
