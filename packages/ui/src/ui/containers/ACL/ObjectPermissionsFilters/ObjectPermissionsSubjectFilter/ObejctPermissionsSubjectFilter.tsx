import React from 'react';
import Filter from '../../../../components/Filter/Filter';
import i18n from './i18n';

type Props = {
    value: string;
    onUpdate: (value: string) => void;
    className?: string;
};

export function ObjectPermissionsSubjectFilter({value, onUpdate, className}: Props) {
    return (
        <Filter
            className={className}
            placeholder={i18n('context_filter-by-subject')}
            onChange={onUpdate}
            value={value}
            size="m"
            autofocus={false}
        />
    );
}
