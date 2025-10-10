import React, {FC, useMemo} from 'react';
import {useDispatch} from '../../../../store/redux-hooks';
import {
    NavigationTable,
    NavigationTableSchema,
} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import './PreviewTab.scss';
import cn from 'bem-cn-lite';
import {Button, Icon} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {prepareColumns} from '../../../../utils/navigation/prepareColumns';
import {TypeArray} from '../../../../components/SchemaDataType/dataTypes';
import {YsonSettings} from '../../../../store/selectors/thor/unipika';
import {onCellPreview} from '../../../../store/actions/navigation/modals/cell-preview';

const b = cn('navigation-preview-tab');

type Props = {
    table: NavigationTable;
    ysonSettings: YsonSettings;
    onEditorInsert: () => void;
};

export const PreviewTab: FC<Props> = ({table, ysonSettings, onEditorInsert}) => {
    const dispatch = useDispatch();
    const onShowPreview = React.useCallback(
        (columnName: string, rowIndex: number) => {
            dispatch(onCellPreview({columnName, rowIndex}));
        },
        [dispatch],
    );
    const columns = useMemo(() => {
        return prepareColumns({
            columns: table.columns.map((i) => ({name: i})),
            keyColumns: [],
            yqlTypes: table.yqlTypes as TypeArray[] | null,
            ysonSettings,
            useRawStrings: undefined,
            schemaByName: table.schema.reduce<Record<string, NavigationTableSchema>>(
                (acc, item) => {
                    acc[item.name] = item;
                    return acc;
                },
                {},
            ),
            onShowPreview,
        });
    }, [table, ysonSettings]);

    return (
        <div>
            <Button onClick={onEditorInsert}>
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                insert SELECT
            </Button>
            <DataTableYT className={b()} columns={columns} data={table.rows} useThemeYT />
        </div>
    );
};
