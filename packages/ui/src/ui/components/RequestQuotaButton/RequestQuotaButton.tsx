import React from 'react';
import Button from '../../components/Button/Button';
import {getMetrics} from '../../common/utils/metrics';
import {openInNewTab} from '../../utils/utils';
import {isDocsAllowed} from '../../config';
import UIFactory from '../../UIFactory';
import i18n from './i18n';

interface Props {
    className?: string;
    page: string;
}

export function RequestQuotaButton(props: Props) {
    const {className, page} = props;
    const url = UIFactory.docsUrls['common:quota_request'];

    return isDocsAllowed() && url !== '' ? (
        <span className={className}>
            <Button
                view={'action'}
                onClick={async () => {
                    getMetrics().countEvent('request_quota', page);

                    openInNewTab(url);
                }}
            >
                {i18n('action_request-quota')}
            </Button>
        </span>
    ) : null;
}
