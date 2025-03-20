import React from 'react';
import cn from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import {YTErrorBlock} from '../../../../components/Error/Error';
import ErrorDetails from '../../../../components/ErrorDetails/ErrorDetails';
import {ErrorToClipboardButton} from '../../../../components/ErrorToClipboardButton/ErrorToClipboardButton';
import {NavigationErrorImage} from './NavigationErrorImage';
import {RequestPermission} from './RequestPermission';
import {getPermissionDeniedError} from '../../../../utils/errors';
import {YTError} from '../../../../../@types/types';
import {ErrorCode, getErrorTitle, getLeadingErrorCode} from './helpers';

import './NavigationError.scss';

const block = cn('navigation-error');

type Props = {
    path?: string;
    details: YTError;
    cluster: string;
    message: string;
};

function PrettyError(props: Props & {code: ErrorCode}) {
    const {details, path, cluster, code} = props;

    const error = code == 901 ? getPermissionDeniedError(details)! : details;
    const title = getErrorTitle({...error, code}, path);

    return (
        <Flex className={block()} justifyContent="center" alignItems="center" gap={7}>
            <Flex>
                <NavigationErrorImage type={code} />
            </Flex>
            <Flex direction="column" className={block('info')} gap={4}>
                <Text className={block('title')}>{title}</Text>
                <ErrorDetails error={details} />
                <Flex direction="row" gap={3}>
                    {code === 901 ? (
                        <RequestPermission cluster={cluster} path={path} error={error} />
                    ) : (
                        <ErrorToClipboardButton
                            className={block('copy')}
                            view="outlined"
                            error={details}
                        >
                            Copy error details
                        </ErrorToClipboardButton>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
}

function UnexpectedError(props: Props) {
    const {details, message} = props;

    return <YTErrorBlock className={block('unexpected-error')} error={details} message={message} />;
}

export function NavigationError(props: Props) {
    const {details} = props;

    const code = getLeadingErrorCode(details);

    return (
        <>
            {code === 500 || code === 901 ? (
                <PrettyError {...props} code={code} />
            ) : (
                <UnexpectedError {...props} />
            )}
        </>
    );
}
