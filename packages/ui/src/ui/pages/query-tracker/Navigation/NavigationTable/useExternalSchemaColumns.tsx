import {skipToken} from '@reduxjs/toolkit/query';
import {useExternalSchemaQuery} from '../../../../store/api/navigation/tabs/externalSchema';
import React, {useMemo} from 'react';
import type {ExternalSchemaColumn} from '@ytsaurus/components/modules';

import UIFactory from '../../../../UIFactory';
import {ExternalDescription} from '../../../navigation/tabs/Schema/ExternalDescription/ExternalDescription';
import Icon from '../../../../components/Icon/Icon';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import ErrorIcon from '../../../../components/ErrorIcon/ErrorIcon';
import type {YTError} from '@ytsaurus/components';

const EXTERNAL_COLUMNS = ['title', 'description'] as const;

type ExternalColumn = (typeof EXTERNAL_COLUMNS)[number];

const renderHeader = (caption: string, url?: string, error?: YTError) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
        <span>{caption}</span>
        {url ? (
            <RoutedLink href={url} target="_blank" disablePreserveLocation>
                <Icon awesome="external-link" />
            </RoutedLink>
        ) : null}
        {error ? <ErrorIcon error={error} /> : null}
    </div>
);

export function useExternalSchemaColumns(
    cluster?: string,
    path?: string,
): {columns?: ExternalSchemaColumn[]; loading: boolean} {
    const {currentData, error, isFetching} = useExternalSchemaQuery(
        cluster && path ? {cluster, path} : skipToken,
    );
    const externalSchemaUrl = currentData?.url;
    const externalSchemaError = error as YTError | undefined;

    const columns = useMemo(() => {
        if (!currentData?.entries && !externalSchemaError) {
            return undefined;
        }
        const externalSchema = new Map(currentData?.entries);
        const {columns: captions} = UIFactory.externalSchemaDescriptionSetup;

        return EXTERNAL_COLUMNS.map((column: ExternalColumn): ExternalSchemaColumn => {
            const caption = captions?.[column] ?? `External ${column}`;
            return {
                name: column,
                header: renderHeader(caption, externalSchemaUrl, externalSchemaError),
                sortable: false,
                render: ({row}) => {
                    const data = externalSchema.get(row.name);
                    return data ? (
                        <ExternalDescription type={row.type} data={data} column={column} />
                    ) : null;
                },
            };
        });
    }, [currentData, externalSchemaUrl, externalSchemaError]);

    return {columns, loading: isFetching};
}
