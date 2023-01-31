export interface NodeMemoryUsagePreload {
    preload_store_count: number;
    preload_pending_store_count: number;
    preload_pending_bytes: number;
    preload_failed_store_count: number;
    preload_errors: any[];
}

export interface MemoryTotal extends NodeMemoryUsagePreload {
    tablet_dynamic: {
        active: number;
        passive: number;
        backing: number;
        usage: number;
        limit: number;
        [key: string]: number;
    };
    tablet_static: {
        usage: number;
        limit: number;
    };
    row_cache: {
        usage: number;
        limit: number;
    };
}

export interface MemoryBundleTotal extends NodeMemoryUsagePreload {
    tablet_dynamic: {
        active: number;
        passive: number;
        backing: number;
        usage: number;
        limit: number;
        [key: string]: number;
    };
    tablet_static: {
        usage: number;
    };
    row_cache: {
        usage: number;
    };
}

export interface MemoryBundleCell extends NodeMemoryUsagePreload {
    tablet_dynamic: {
        active: number;
        passive: number;
        backing: number;
    };
    tablet_static: {
        usage: number;
    };
    row_cache: {
        usage: number;
    };
}

export interface MemoryBundle {
    total: MemoryBundleTotal;
    cells: Record<string, MemoryBundleCell>;
}

export interface MemoryTable extends NodeMemoryUsagePreload {
    tablet_dynamic: {
        active: number;
        passive: number;
        backing: number;
    };
    tablet_static: {
        usage: number;
    };
    row_cache: {
        usage: number;
    };
    tablet_cell_bundle: string;
}

export interface MemoryUsage {
    total: MemoryTotal;
    bundles: Record<string, MemoryBundle>;
    tables: Record<string, MemoryTable>;
}
