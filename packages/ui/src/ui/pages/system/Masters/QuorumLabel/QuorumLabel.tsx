import React from 'react';
import i18n from './i18n';

type QuorumLabelProps = {
    className?: string;
    status?: 'quorum' | 'weak-quorum' | 'no-quorum';
};

export function QuorumLabel({className, status = 'quorum'}: QuorumLabelProps) {
    return <div className={className}>{i18n(`value_${status}`)}</div>;
}
