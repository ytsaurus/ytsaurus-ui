import React from 'react';
import {Flex, Spin} from '@gravity-ui/uikit';

import {ClickableText} from '../../../../../components/ClickableText/ClickableText';
import {YTErrorInline} from '../../../../../containers/YTErrorInline/YTErrorInline';
import {type ReplicaDiagnostics} from '../../../../../store/api/navigation/replica-statuses';
import {type YTError} from '../../../../../types';
import {showErrorPopup} from '../../../../../utils/utils';
import i18n from '../i18n';

type Props = {result?: ReplicaDiagnostics};

export function ReplicaStatusesCell({result}: Props) {
    if (result?.error) {
        return <YTErrorInline error={result.error} message={i18n('alert_failed-to-load')} />;
    }
    if (!result?.output) {
        return <Spin size="xs" />;
    }

    const {alerts, errors} = result.output;
    if (!alerts.length && !errors.length) {
        return <React.Fragment>—</React.Fragment>;
    }

    return (
        <Flex direction="column" gap={1}>
            <ReplicaStatusLink type="alert" errors={alerts} />
            <ReplicaStatusLink type="error" errors={errors} />
        </Flex>
    );
}

type ReplicaStatusLinkProps = {
    type: 'alert' | 'error';
    errors: YTError[];
};

function ReplicaStatusLink({type, errors}: ReplicaStatusLinkProps) {
    if (!errors.length) {
        return null;
    }

    const message = i18n(type === 'alert' ? 'value_alerts-count' : 'value_errors-count', {
        count: errors.length,
    });

    return (
        <ClickableText
            color={type === 'alert' ? 'warning' : 'danger'}
            onClick={() => {
                showErrorPopup({message, inner_errors: errors}, {type});
            }}
        >
            {message}
        </ClickableText>
    );
}
