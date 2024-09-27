import React, {FC, useMemo} from 'react';
import {
    NavigationTable,
    NavigationTableSchema,
} from '../../module/queryNavigation/queryNavigationSlice';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import './PreviewTab.scss';
import cn from 'bem-cn-lite';
import {Button, Icon} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {prepareColumns} from '../../../../utils/navigation/prepareColumns';
import {TypeArray} from '../../../../components/SchemaDataType/dataTypes';
import {YsonSettings} from '../../../../store/selectors/thor/unipika';

const b = cn('navigation-preview-tab');

type Props = {
    table: NavigationTable;
    ysonSettings: YsonSettings;
    onEditorInsert: () => void;
};

export const PreviewTab: FC<Props> = ({table, ysonSettings, onEditorInsert}) => {
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
