export type QueueExportConfig<NumberType extends {value: number} | number> = {
    export_period: NumberType;
    export_directory: string;
    output_table_name_pattern?: string;
    use_upper_bound_for_table_names?: boolean;
    export_ttl?: NumberType;
};
