import React, {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ElementsTableRaw from '../../../../components/ElementsTable/ElementsTable';

import {abortAndReset, loadJobSpecification} from '../../../../store/actions/job/specification';
import {getJobPivotKeysData} from '../../../../store/selectors/job/detail';
import {RootState} from '../../../../store/reducers';
import unipika from '../../../../common/thor/unipika';

const block = cn('job-pivot-keys');
const ElementsTable: any = ElementsTableRaw;

interface PivotKey {
    id: string;
    from: string[];
    to: string[];
}

const getTableColumns = () => {
    return {
        items: {
            id: {
                name: 'id',
                caption: 'Chunk ID',
                align: 'left',
            },
            from: {
                name: 'from',
                align: 'left',
            },
            to: {
                name: 'to',
                align: 'left',
            },
        },
        sets: {
            default: {
                items: ['id', 'from', 'to'],
            },
        },
        mode: 'default',
    };
};

const getTableTemplates = () => {
    const renderKey = (item: PivotKey, key: 'from' | 'to') => {
        // @ts-ignore
        const text = unipika.prettyprint(item[key], {
            break: false,
            indent: 0,
            asHTML: false,
        });
        const title = text.split(',').join(',\n');

        return (
            <div className="unipika">
                [
                <span title={title} className="uint64 elements-ellipsis">
                    {text.slice(1, -1)}
                </span>
                ]
            </div>
        );
    };

    return {
        from(item: PivotKey) {
            return renderKey(item, 'from');
        },
        to(item: PivotKey) {
            return renderKey(item, 'to');
        },
    };
};

export default function PivotKeys() {
    const dispatch = useDispatch();

    const {job} = useSelector((state: RootState) => state.job.general);
    const {loading, loaded, error, errorData} = useSelector(
        (state: RootState) => state.job.specification,
    );
    const pivotKeysItems = useSelector(getJobPivotKeysData);

    useEffect(() => {
        if (job?.id) {
            dispatch(loadJobSpecification(job.id));
        }

        return () => {
            dispatch(abortAndReset());
        };
    }, [dispatch, job?.id]);

    const columns = useMemo(getTableColumns, []);
    const templates = useMemo(getTableTemplates, []);

    return (
        <div className={block({loading})}>
            <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                <ElementsTable
                    size="s"
                    theme="light"
                    css={block()}
                    virtual={false}
                    striped={false}
                    columns={columns}
                    isLoading={loading}
                    templates={templates}
                    items={pivotKeysItems}
                />
            </LoadDataHandler>
        </div>
    );
}
