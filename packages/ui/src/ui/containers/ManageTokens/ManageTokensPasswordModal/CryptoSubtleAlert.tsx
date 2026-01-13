import * as React from 'react';
import {Alert, Link} from '@gravity-ui/uikit';
import i18n from './i18n';

export function CryptoSubtleAlert() {
    return (
        <Alert
            message={
                <span>
                    <Link
                        target="_blank"
                        href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle"
                    >
                        crypto.subtle
                    </Link>{' '}
                    {i18n('alert_crypto-subtle-unavailable')}
                </span>
            }
        />
    );
}
