import {Flex, type FlexProps, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';

import {type YTError} from '../../../@types/types';
import {AccessDenied, NotFound} from '@gravity-ui/illustrations';
import ErrorDetails from '../ErrorDetails/ErrorDetails';
import {YTErrorBlock} from '../Block/Block';
import {ErrorToClipboardButton} from '../ErrorToClipboardButton/ErrorToClipboardButton';

import './PrettyError.scss';
import {
    type ErrorTitlePayload,
    type ErrorsInfoMap,
    determineErrorCode,
    getErrorTitle,
} from './helpers';
import i18n from './i18n';

const block = cn('pretty-error-page');

export type PrettyErrorProps = {
    error: YTError;
    errorCode?: number;
    errorsInfo: ErrorsInfoMap;
    errorContext?: Partial<ErrorTitlePayload>;
    renderActions?: (error: YTError) => React.ReactNode;
    renderAdditionalContent?: () => React.ReactNode;
    vertical?: boolean;
    className?: string;
};

interface PrettyErrorViewProps extends PrettyErrorProps {
    code: number;
    title: string;
}

function PrettyErrorView(props: PrettyErrorViewProps) {
    const {error, title, code, renderActions, renderAdditionalContent, vertical, className} = props;

    const ErrorImage = code === 901 ? AccessDenied : NotFound;
    const direction: FlexProps['direction'] = vertical ? 'column' : undefined;

    return (
        <Flex
            direction="column"
            minHeight="calc(100vh - 3 * var(--app-header-height) - var(--app-footer-height))"
            className={block(null, className)}
        >
            {renderAdditionalContent?.()}
            <Flex
                className={block()}
                justifyContent="center"
                alignItems="center"
                direction={direction}
                gap={7}
            >
                <Flex>
                    <Icon data={ErrorImage} size={150} />
                </Flex>
                <Flex direction="column" className={block('info')} gap={3}>
                    <Text className={block('title')}>{title}</Text>
                    <ErrorDetails error={error} />
                    <Flex gap={3} direction={direction}>
                        {renderActions?.(error)}
                        <ErrorToClipboardButton size="m" view="outlined" error={error}>
                            {i18n('action_copy-error-details')}
                        </ErrorToClipboardButton>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}

export function PrettyError(props: PrettyErrorProps) {
    const {error, className, errorsInfo, errorContext} = props;
    const code = props.errorCode ?? determineErrorCode(error, errorsInfo);

    const title = getErrorTitle(error, code, errorsInfo, errorContext) || i18n('unexpected-error');

    if (code && errorsInfo && errorsInfo[code]) {
        return <PrettyErrorView {...props} code={code} title={title} />;
    }

    return <YTErrorBlock className={block('unexpected-error', className)} error={error} />;
}
