import React from 'react';
import PropTypes from 'prop-types';
import ypath from '../../../common/thor/ypath';
import cn from 'bem-cn-lite';

import OperationWeight from '../../../pages/operations/OperationWeight/OperationWeight';
import {OperationPool} from '../../../components/OperationPool/OperationPool';
import CollapsibleList from '../../../components/CollapsibleList/CollapsibleList';
import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';

import {Template} from '../../../components/MetaTable/MetaTable';
import {paramsToQuery} from '../../../utils';
import hammer from '../../../common/hammer';
import {Page} from '../../../constants/index';
import CollapsableText from '../../../components/CollapsableText/CollapsableText';
import {genNavigationUrl} from '../../../utils/navigation/navigation';

const itemBlock = cn('meta-table-item');
const detailBlock = cn('operation-detail');

export interface Pool {
    pool: string;
    tree: string;
    isEphemeral?: boolean;
    isLightweight?: boolean;
    weight?: number;
}

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplatePoolsProps {
    className?: string;
    cluster: string;
    reserveEditButton?: boolean;
    compact?: boolean;
    onEdit?: () => void;
    state?: 'completed' | 'failed' | 'aborted' | string;
    pools: Pool[];
    erasedTrees?: Record<string, boolean | undefined>;
    allowDetachEditBtn?: boolean;
}

export function TemplatePools({
    pools = [],
    cluster,
    state,
    onEdit,
    compact = false,
    erasedTrees = {},
    allowDetachEditBtn,
}: TemplatePoolsProps) {
    return (
        <ul className={itemBlock('pools', 'elements-list elements-list_type_unstyled')}>
            {pools.map((pool) => (
                <OperationPool
                    key={pool.pool + '/' + pool.tree}
                    compact={compact}
                    cluster={cluster}
                    onEdit={onEdit}
                    state={state}
                    pool={pool}
                    erased={erasedTrees[pool.tree]}
                    allowDetachEditBtn={allowDetachEditBtn}
                />
            ))}
        </ul>
    );
}

TemplatePools.propTypes = {
    cluster: PropTypes.string.isRequired,
    state: PropTypes.string,
    onEdit: PropTypes.func,
    compact: PropTypes.bool,
};

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplateTransferTaskProps {
    id?: string;
    url?: string;
}

export function TemplateTransferTask({id, url}: TemplateTransferTaskProps) {
    return !url ? (
        id
    ) : (
        <Link url={url}>
            {id} <Icon awesome="external-link" />
        </Link>
    );
}

TemplateTransferTask.propTypes = {
    id: PropTypes.string,
    url: PropTypes.string,
};

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplateCommandProps {
    value: string | string[];
    lineCount?: number;
    settings?: Record<string, unknown>;
}

export function TemplateCommand({value, lineCount, settings}: TemplateCommandProps) {
    const command = Array.isArray(value) ? hammer.format['Command'](value) : value;

    return <Template.CollapsableText value={command} lineCount={lineCount} settings={settings} />;
}

TemplateCommand.propTypes = {
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    lineCount: PropTypes.number,
    settings: PropTypes.object,
};

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplateEnvironmentProps {
    environments: {name: string; value: unknown}[];
}

export function TemplateEnvironment({environments = []}: TemplateEnvironmentProps) {
    const variables = environments.map(({name, value}) => {
        const preparedValue = ypath.getValue(value);

        return (
            <div className={detailBlock('script-environment')} key={name + '/' + preparedValue}>
                <span>{name}</span>=<span>{preparedValue}</span>
            </div>
        );
    });

    return <CollapsableText lineCount={4}>{variables}</CollapsableText>;
}

TemplateEnvironment.propTypes = {
    environments: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }).isRequired,
    ).isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplateFileProps {
    cluster: string;
    path: string;
    originalPath: string;
    name?: string;
    executable?: boolean;
}

function TemplateFile({name, path, originalPath, executable, cluster}: TemplateFileProps) {
    const getQuery = (p: string) => paramsToQuery({path: p});
    const getUrl = (p: string) => `/${cluster}/${Page.NAVIGATION}?${getQuery(p)}`;

    return (
        <li className={itemBlock('file')}>
            <Link title={path} url={getUrl(path)}>
                {name || originalPath || path}
                {executable && <Icon awesome="cogs" />}
            </Link>
            &emsp;
            {originalPath && (
                <Link title={originalPath} url={getUrl(originalPath)}>
                    <Icon awesome="folders" />
                </Link>
            )}
        </li>
    );
}

TemplateFile.propTypes = {
    cluster: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    originalPath: PropTypes.string,
    name: PropTypes.string,
    executable: PropTypes.bool,
};

interface TemplateFilesProps {
    files: Parameters<typeof TemplateFile>[0][];
    cluster: string;
}

export function TemplateFiles({files = [], cluster}: TemplateFilesProps) {
    const items = files.map((file) => (
        <TemplateFile {...file} cluster={cluster} key={file.path + '/' + file.name} />
    ));

    return <CollapsibleList items={items} />;
}

TemplateFiles.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            path: PropTypes.string,
            name: PropTypes.string,
            executable: PropTypes.bool,
        }),
    ).isRequired,
    cluster: PropTypes.string.isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplateLivePreivewProps {
    path: string;
    cluster: string;
    transaction: string;
}

export function TemplateLivePreivew({path, transaction, cluster}: TemplateLivePreivewProps) {
    const url = genNavigationUrl({cluster, path, transaction});

    return (
        <Link url={url} title="Live preview">
            <Icon awesome="play-circle" />
            Live preview
        </Link>
    );
}

TemplateLivePreivew.propTypes = {
    transaction: PropTypes.string.isRequired,
    cluster: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */

interface TemplateWeightProps {
    operation: Record<string, unknown>;
    onEdit: () => void;
    pool: Pool;
}

export function TemplateWeight({operation, pool, onEdit}: TemplateWeightProps) {
    return (
        <OperationWeight
            onEdit={onEdit}
            operation={operation}
            treeName={pool.tree}
            weight={pool.weight}
        />
    );
}

TemplateWeight.propTypes = {
    operation: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
};

interface TemplateLayerPathProps {
    cluster: string;
    path: string;
}

function TemplateLayerPath({cluster, path}: TemplateLayerPathProps) {
    const getQuery = (p: string) => paramsToQuery({path: p});
    const getUrl = (p: string) => `/${cluster}/${Page.NAVIGATION}?${getQuery(p)}`;

    return (
        <li>
            <Link url={getUrl(path)} title={path}>
                {path}
            </Link>
        </li>
    );
}

interface TemplateLayerPathsProps {
    cluster: string;
    paths: string[];
}

export function TemplateLayerPaths({cluster, paths}: TemplateLayerPathsProps) {
    const items = paths.map((path) => (
        <TemplateLayerPath path={path} key={path} cluster={cluster} />
    ));

    return <CollapsibleList items={items} itemsCount={4} />;
}
