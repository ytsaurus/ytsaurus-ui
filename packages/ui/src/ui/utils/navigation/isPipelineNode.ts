export function isPipelineNode(attrs?: {pipeline_format_version?: number}) {
    return attrs?.pipeline_format_version !== undefined;
}
