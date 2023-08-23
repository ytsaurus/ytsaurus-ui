import React from 'react';
import PropTypes from 'prop-types';
import ypath from '../../../common/thor/ypath';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import qs from 'qs';

import OperationWeight from '../../../pages/operations/OperationWeight/OperationWeight';
import OperationPool from '../../../pages/operations/OperationPool/OperationPool';
import CollapsibleList from '../../../components/CollapsibleList/CollapsibleList';
import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';

import {Template} from '../../../components/MetaTable/MetaTable';
import {paramsToQuery} from '../../../utils';
import hammer from '../../../common/hammer';
import {Page} from '../../../constants/index';
import CollapsableText from '../../../components/CollapsableText/CollapsableText';

const itemBlock = cn('meta-table-item');
const detailBlock = cn('operation-detail');

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplatePool({pool, state, cluster, onEdit, compact, reserveEditButton}) {
    return (
        <OperationPool
            pool={pool}
            state={state}
            onEdit={onEdit}
            cluster={cluster}
            compact={compact}
            reserveEditButton={reserveEditButton}
        />
    );
}

TemplatePool.propTypes = OperationPool.propTypes;
TemplatePool.defaultProps = OperationPool.defaultProps;

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplatePools({pools, cluster, state, onEdit, compact, erasedTrees = {}}) {
    return (
        <ul className={itemBlock('pools', 'elements-list elements-list_type_unstyled')}>
            {_.map(pools, (pool) => (
                <OperationPool
                    key={pool.name + '/' + pool.tree}
                    compact={compact}
                    cluster={cluster}
                    onEdit={onEdit}
                    state={state}
                    pool={pool}
                    erased={erasedTrees[pool.tree]}
                />
            ))}
        </ul>
    );
}

TemplatePools.propTypes = {
    pools: PropTypes.arrayOf(OperationPool.poolType).isRequired,
    cluster: PropTypes.string.isRequired,
    state: PropTypes.string,
    onEdit: PropTypes.func,
    compact: PropTypes.bool,
};

TemplatePools.defaultProps = {
    compact: false,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateTransferTask({id, url}) {
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

export function TemplateCommand({value, lineCount, settings}) {
    const command = Array.isArray(value) ? hammer.format['Command'](value) : value;

    return <Template.CollapsableText value={command} lineCount={lineCount} settings={settings} />;
}

TemplateCommand.propTypes = {
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    lineCount: PropTypes.number,
    settings: PropTypes.object,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateEnvironment({environments}) {
    const variables = _.map(environments, ({name, value}) => {
        const preparedValue = ypath.getValue(value);

        return (
            <div className={detailBlock('script-environment')} key={name + '/' + preparedValue}>
                <span>{name}</span>=<span>{preparedValue}</span>
            </div>
        );
    });

    return <CollapsableText lineCount={10}>{variables}</CollapsableText>;
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

function TemplateFile({name, path, originalPath, executable, cluster}) {
    const getQuery = (path) => paramsToQuery({path: path});
    const getUrl = (path) => `/${cluster}/${Page.NAVIGATION}?${getQuery(path)}`;

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

export function TemplateFiles({files, cluster}) {
    const items = _.map(files, (file) => (
        <TemplateFile {...file} cluster={cluster} key={file.path + '/' + file.name} />
    ));

    return <CollapsibleList className={itemBlock('files')} items={items} />;
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

export function TemplateIntermediate({path, transaction, cluster}) {
    const query = qs.stringify({path, t: transaction}, {encode: false});
    const url = `/${cluster}/${Page.NAVIGATION}?${query}`;

    return (
        <Link url={url} title="Live preview">
            <Icon awesome="play-circle" />
            Live preview
        </Link>
    );
}

TemplateIntermediate.propTypes = {
    transaction: PropTypes.string.isRequired,
    cluster: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */

export function TemplateWeight({operation, pool, onEdit}) {
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
    pool: OperationPool.poolType.isRequired,
    onEdit: PropTypes.func.isRequired,
};

/* ----------------------------------------------------------------------------------------------------------------- */
