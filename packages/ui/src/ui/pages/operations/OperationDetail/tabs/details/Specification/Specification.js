import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import MetaTable, {
    TemplateCommand,
    TemplateEnvironment,
    TemplateFiles,
    TemplateLivePreivew,
    TemplateTransferTask,
} from '../../../../../../components/MetaTable/MetaTable';
import CollapsibleTable from '../../../../../../components/CollapsibleTable/CollapsibleTable';
import Yson from '../../../../../../components/Yson/Yson';

import {
    inputTableProps,
    outputTableProps,
    stderrTableProps,
} from '../../../../../../utils/operations/tabs/details/specification/specificationTablesProps';
import {
    filterVisibleItems,
    prepareVisibleItems,
} from '../../../../../../utils/operations/tabs/details/specification/specification';
import hammer from '../../../../../../common/hammer';

import './Specification.scss';

const headingBlock = cn('elements-heading');
const specificationBlock = cn('specification');

const scriptProps = PropTypes.shape({
    type: PropTypes.string.isRequired,
    caption: PropTypes.string,
    command: PropTypes.string,
    className: PropTypes.string,
    jobCount: PropTypes.number,
    files: PropTypes.arrayOf(
        PropTypes.shape({
            path: PropTypes.string,
            name: PropTypes.string,
            executable: PropTypes.bool,
        }),
    ),
    environment: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.string,
        }),
    ),
});
export const specificationProps = PropTypes.shape({
    transferTask: PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string,
    }),
    mode: PropTypes.string,
    remote: PropTypes.shape({
        cluster: PropTypes.string.isRequired,
        network: PropTypes.string,
    }),
    startedBy: PropTypes.shape({
        command: PropTypes.arrayOf(PropTypes.string).isRequired,
        fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    }),
    intermediate: PropTypes.shape({
        supported: PropTypes.bool.isRequired,
        path: PropTypes.string,
        transaction: PropTypes.string,
    }),
    mapper: scriptProps,
    reducer: scriptProps,
    reduceCombiner: scriptProps,
    tasks: PropTypes.arrayOf(scriptProps),
});

export default class Specification extends Component {
    static propTypes = {
        specification: specificationProps.isRequired,
        cluster: PropTypes.string.isRequired,
    };

    renderTransferTask({id, url, mode}) {
        return (
            <MetaTable
                className={specificationBlock('meta')}
                items={[
                    {
                        key: 'mode',
                        value: mode,
                        visible: Boolean(mode),
                    },
                    {
                        key: 'transfer task',
                        value: <TemplateTransferTask id={id} url={url} />,
                        visible: Boolean(id || url),
                    },
                ]}
            />
        );
    }

    renderRemote({cluster, network}) {
        return (
            <div className={specificationBlock('remote')}>
                <div className={headingBlock({size: 's'})}>Remote</div>

                <MetaTable
                    items={[
                        {key: 'cluster', value: cluster},
                        {key: 'network', value: network},
                    ]}
                />
            </div>
        );
    }

    renderStartedBy({fields = [], command}) {
        const items = fields.map((field) => ({
            key: field.name,
            value: typeof field.value === 'object' ? <Yson value={field.value} /> : field.value,
        }));

        items.push({
            key: 'command',
            value: <TemplateCommand value={command} lineCount={5} />,
        });

        return (
            <div className={specificationBlock('started-by')}>
                <div className={headingBlock({size: 's'})}>Started by</div>

                <MetaTable items={items} />
            </div>
        );
    }

    renderScript({type, caption, className, jobCount, environment, files, command}) {
        const {cluster} = this.props;

        return (
            <div className={specificationBlock('mapper')} key={`${type}/${caption}/${className}`}>
                <div className={headingBlock({size: 's'})}>
                    {hammer.format['ReadableField'](caption || type)}
                </div>

                <MetaTable
                    items={[
                        {
                            key: 'class name',
                            value: className,
                            visible: Boolean(className),
                        },
                        {
                            key: 'job count',
                            value: jobCount,
                            visible: Boolean(jobCount),
                        },
                        {
                            key: 'environment',
                            value: <TemplateEnvironment environments={environment} />,
                            visible: environment.length > 0,
                        },
                        {
                            key: 'files',
                            value: <TemplateFiles files={files} cluster={cluster} />,
                            visible: files.length > 0,
                        },
                        {
                            key: 'command',
                            value: <TemplateCommand value={command} lineCount={5} />,
                            visible: Boolean(command),
                        },
                    ]}
                />
            </div>
        );
    }

    renderIO(type, items, tableProps) {
        return (
            <CollapsibleTable
                {...tableProps}
                prepareVisibleItems={prepareVisibleItems}
                filterVisibleItems={filterVisibleItems}
                className={specificationBlock(type)}
                css={specificationBlock('io')}
                heading={type}
                items={items}
            />
        );
    }

    renderIntermediate(intermediate, title) {
        const {cluster} = this.props;

        return (
            <div className={specificationBlock('intermediate')}>
                <div className={headingBlock({size: 's'})}>{title}</div>

                <TemplateLivePreivew {...intermediate} cluster={cluster} />
            </div>
        );
    }

    renderTasks(tasks = []) {
        return tasks.map((task) => task && this.renderScript(task));
    }

    render() {
        const {
            mode,
            transferTask,
            remote,
            startedBy,
            mapper,
            reducer,
            reduceCombiner,
            input,
            intermediate,
            output,
            stderr,
            tasks,
            coredumps,
        } = this.props.specification;

        return (
            <div className={specificationBlock()}>
                {(transferTask || mode) && this.renderTransferTask({...transferTask, mode})}

                {remote && this.renderRemote(remote)}
                {startedBy && this.renderStartedBy(startedBy)}

                {input?.length > 0 && this.renderIO('input', input, inputTableProps)}
                {intermediate && this.renderIntermediate(intermediate, 'Intermediate')}
                {output?.length > 0 && this.renderIO('output', output, outputTableProps)}
                {stderr?.length > 0 && this.renderIO('stderr', stderr, stderrTableProps)}
                {coredumps?.length > 0 && this.renderIO('core', coredumps, stderrTableProps)}

                {mapper && this.renderScript(mapper)}
                {reducer && this.renderScript(reducer)}
                {reduceCombiner && this.renderScript(reduceCombiner)}

                {tasks && this.renderTasks(tasks)}
            </div>
        );
    }
}
