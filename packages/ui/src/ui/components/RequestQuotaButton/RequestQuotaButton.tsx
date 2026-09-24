import React from 'react';
import Button from '../../components/Button/Button';
import {getMetrics} from '../../common/utils/metrics';
import {openInNewTab} from '../../utils/utils';
import {isDocsAllowed} from '../../config';
import UIFactory from '../../UIFactory';
import i18n from './i18n';
import {type ButtonActionRole} from '../ThemePropsConfigProvider';

interface Props {
    actionRole: ButtonActionRole;
    className?: string;
    page: string;
}

export function RequestQuotaButton(props: Props) {
    const {actionRole, className, page} = props;
    const url = UIFactory.docsUrls['common:quota_request'];

    return isDocsAllowed() && url !== '' ? (
        <span className={className}>
            <Button
                actionRole={actionRole}
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
