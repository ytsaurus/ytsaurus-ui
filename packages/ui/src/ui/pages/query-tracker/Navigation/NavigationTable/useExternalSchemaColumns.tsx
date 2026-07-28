import React, {useEffect, useMemo, useState} from 'react';
import type {ExternalSchemaColumn} from '@ytsaurus/components/modules';

import UIFactory from '../../../../UIFactory';
import type {ExternalSchemaDescriptionResponse} from '../../../../UIFactory';
import type {ExternalSchemaDescription} from '../../../navigation/tabs/Schema/ExternalDescription/ExternalDescription';
import {ExternalDescription} from '../../../navigation/tabs/Schema/ExternalDescription/ExternalDescription';
import Icon from '../../../../components/Icon/Icon';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import ErrorIcon from '../../../../components/ErrorIcon/ErrorIcon';
import type {YTError} from '@ytsaurus/components';

const EXTERNAL_COLUMNS = ['title', 'description'] as const;

type ExternalColumn = (typeof EXTERNAL_COLUMNS)[number];

type State = {
    externalSchema?: Map<string, ExternalSchemaDescription>;
    externalSchemaUrl?: string;
    externalSchemaError?: YTError;
};

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
): ExternalSchemaColumn[] | undefined {
    const [state, setState] = useState<State>({});

    useEffect(() => {
        let cancelled = false;

        if (!cluster || !path) {
            setState({});
            return undefined;
        }

        UIFactory.externalSchemaDescriptionSetup
            .load(cluster, path)
            .then(({url, externalSchema}: ExternalSchemaDescriptionResponse) => {
                if (!cancelled) {
                    setState({externalSchemaUrl: url, externalSchema});
                }
            })
            .catch((error: YTError) => {
                if (!cancelled) {
                    setState({externalSchema: new Map(), externalSchemaError: error});
                }
            });

        return () => {
            cancelled = true;
        };
    }, [cluster, path]);

    const {externalSchema, externalSchemaUrl, externalSchemaError} = state;

    return useMemo(() => {
        if (!externalSchema) {
            return undefined;
        }

        const {columns} = UIFactory.externalSchemaDescriptionSetup;

        return EXTERNAL_COLUMNS.map((column: ExternalColumn): ExternalSchemaColumn => {
            const caption = columns?.[column] ?? `External ${column}`;
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
    }, [externalSchema, externalSchemaUrl, externalSchemaError]);
}
