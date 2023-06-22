import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Button, ButtonProps, Select, SelectOption} from '@gravity-ui/uikit';
import {Engines, QueryEngine} from '../module/api';
import {createNewQueryUrl} from '../utils/navigation';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';
import {QueryEnginesNames} from '../utils/query';

import './index.scss';

const block = cn('query-new-button');

const engineSelectorItem = cn('query-language-selector-item');

export type QueryTracketrNewButtonProps = {
    className?: string;
    view?: ButtonProps['view'];
    cluster: string;
    engines?: QueryEngine[];
    defaultEngine?: QueryEngine;
    target?: '_blank';
    renderDefaultTitle: (props: {engine: QueryEngine; engineTitle: string}) => React.ReactChild;
    path?: string;
};

export const QueryTrackerNewButton = ({
    className,
    view,
    cluster,
    path,
    engines = Engines,
    renderDefaultTitle,
    defaultEngine = QueryEngine.YQL,
    target,
}: QueryTracketrNewButtonProps) => {
    const engineOptions = useMemo<SelectOption[]>(() => {
        return engines
            .filter((engine) => engine !== defaultEngine)
            .map((engine) => ({
                value: engine,
                content: (
                    <Link
                        className={engineSelectorItem('link')}
                        routed={target !== '_blank'}
                        url={createNewQueryUrl(cluster, engine, {path})}
                    >
                        {QueryEnginesNames[engine]}
                    </Link>
                ),
            }));
    }, [cluster, defaultEngine, engines, path]);

    return (
        <div className={block(null, className)}>
            <Link
                routed={target !== '_blank'}
                url={createNewQueryUrl(cluster, defaultEngine, {path})}
            >
                <Button
                    className={block('default')}
                    view={view}
                    pin={engineOptions?.length ? 'round-clear' : 'round-round'}
                >
                    {renderDefaultTitle({
                        engine: defaultEngine,
                        engineTitle: QueryEnginesNames[defaultEngine],
                    })}
                </Button>
            </Link>
            {Boolean(engineOptions?.length) && (
                <Select
                    popupClassName={block('select')}
                    options={engineOptions}
                    value={undefined}
                    renderControl={({onClick, onKeyDown, ref}) => (
                        <Button
                            ref={ref}
                            onClick={onClick}
                            extraProps={{onKeyDown}}
                            view={view}
                            pin="clear-round"
                        >
                            <Icon awesome="chevron-down" />
                        </Button>
                    )}
                />
            )}
        </div>
    );
};
