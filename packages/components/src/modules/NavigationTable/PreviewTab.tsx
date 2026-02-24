import {FC, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {NavigationTableData} from '../../types';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import i18n from './i18n';
import {DataTableYT} from '../../components';
import {prepareColumns} from './prepareColumns';
import type {SchemaDataTypePrimitiveTypes, TypeArray} from '../../components/SchemaDataType';
import './PreviewTab.scss';

const b = cn('navigation-table-preview-tab');

type PreviewTabProps = {
    table: NavigationTableData;
    onEditorInsert: () => void | Promise<void>;
    ysonSettings?: UnipikaSettings;
    primitiveTypes?: SchemaDataTypePrimitiveTypes;
};

export const PreviewTab: FC<PreviewTabProps> = ({
    table,
    onEditorInsert,
    ysonSettings,
    primitiveTypes,
}) => {
    const onShowPreview = () => {};
    const columns = useMemo(() => {
        return prepareColumns({
            columns: table.columns.map((i) => ({name: i})),
            keyColumns: [],
            yqlTypes: table.yqlTypes as TypeArray[] | null,
            ysonSettings,
            useRawStrings: undefined,
            schemaByName: table.schema.reduce<
                Record<
                    string,
                    {
                        name: string;
                        required: boolean;
                        sort_order?: string;
                        type: string;
                    }
                >
            >((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, {}),
            onShowPreview,
            primitiveTypes,
        });
    }, [table, ysonSettings, primitiveTypes]);

    return (
        <div className={b()}>
            <Button onClick={() => onEditorInsert()}>
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                {i18n('action_insert-select')}
            </Button>
            <DataTableYT className={b()} columns={columns} data={table.rows} useThemeYT />
        </div>
    );
};
