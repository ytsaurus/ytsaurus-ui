import unipika from '../../../../common/thor/unipika';
import ypath from '../../../../common/thor/ypath';
import {prepareNavigationState} from '../../../../utils/navigation';

export default class Node {
    static CAPTION_PRINT_SETTINGS = {
        indent: 0,
        break: false,
        binaryAsHex: false,
        highlightControlCharacter: true,
        escapeWhitespace: true,
        format: 'json',
    };

    static TITLE_PRINT_SETTINGS = Object.assign(
        {
            asHTML: false,
        },
        Node.CAPTION_PRINT_SETTINGS,
    );

    static SUPPORTS_RESOURCE_USAGE = {
        table: true,
        file: true,
        journal: true,
        document: true,
    };

    static prepareTitle(name: string) {
        return unipika.prettyprint(name, Node.TITLE_PRINT_SETTINGS);
    }

    static prepareCaption(name: string) {
        return unipika.prettyprint(name, Node.CAPTION_PRINT_SETTINGS);
    }

    static getResource(node: any, name: string) {
        return Node.SUPPORTS_RESOURCE_USAGE[
            ypath.getValue(node, '/@type') as keyof typeof Node.SUPPORTS_RESOURCE_USAGE
        ]
            ? ypath.getValue(node, '/@resource_usage/' + name)
            : ypath.getValue(node.recursiveResourceUsage, '/' + name);
    }

    name: string;
    $value: string;
    $attributes?: Record<string, string>;
    type: string;
    iconType: string;
    title: string;
    caption: string;
    titleUnquoted: string;
    parsedPath: ReturnType<typeof ypath.YPath.clone>;
    parsedPathError?: {
        message: string;
        inner_errors: unknown[];
    };
    path: string;
    pathState: ReturnType<typeof prepareNavigationState>;
    recursiveResourceUsage: boolean;
    dataWeight: number;
    size: number;
    sizePerMedium: number;
    chunks: number;
    nodes: number;
    tabletStaticMemory: number;
    tablets: number;
    masterMemory: number;
    locks: number;
    account: string;
    modified: string;
    created: string;
    linkParsedPath?: ReturnType<typeof ypath.YPath.clone>;
    linkPathState?: ReturnType<typeof prepareNavigationState>;
    targetPath?: string;
    targetPathBroken?: boolean;
    targetPathState?: ReturnType<typeof prepareNavigationState>;

    dynamic?: boolean;
    rows?: number;
    unmergedRows?: number;
    chunkRows?: number;
    tabletState?: string;

    constructor(
        data: string,
        params: {parsedPath: string; transaction: string; contentMode: string},
    ) {
        const {parsedPath, transaction, contentMode} = params;

        const name = ypath.getValue(data);
        const attributes = ypath.getAttributes(data);

        this.$value = this.name = name;
        this.$attributes = attributes;

        this.type = attributes.type;
        this.iconType = attributes.type;

        this.title = Node.prepareTitle(this.name);
        this.caption = Node.prepareCaption(this.name);
        this.titleUnquoted = this.title.slice(1, -1);

        try {
            this.parsedPath = ypath.YPath.clone(parsedPath).concat(
                '/' + ypath.YPath.escapeSpecialCharacters(JSON.parse(this.title)),
            );
        } catch (e) {
            this.parsedPath = ypath.YPath.clone(parsedPath).concat(
                '/' + ypath.YPath.escapeSpecialCharacters(this.title),
            );
            this.parsedPathError = {
                message: `Node name cannot be parsed, try to enable 'Escape and highlight' option in your settings. `,
                inner_errors: [e],
            };
        }
        this.path = this.parsedPath.stringify();
        this.pathState = prepareNavigationState(
            this.parsedPath,
            transaction,
            undefined,
            contentMode,
        );

        // RESOURCES
        this.recursiveResourceUsage = attributes.recursive_resource_usage;

        this.dataWeight = ypath.getValue(this, '/@data_weight');
        this.size = Node.getResource(this, 'disk_space');
        this.sizePerMedium = Node.getResource(this, 'disk_space_per_medium');
        this.chunks = Node.getResource(this, 'chunk_count');
        this.nodes = Node.getResource(this, 'node_count');
        this.tabletStaticMemory = Node.getResource(this, 'tablet_static_memory');
        this.tablets = Node.getResource(this, 'tablet_count');
        this.masterMemory = Node.getResource(this, 'master_memory');

        this.locks = attributes.lock_count;

        this.account = attributes.account;
        this.modified = attributes.modification_time;
        this.created = attributes.creation_time;

        // LINKS
        if (this.type === 'link') {
            this.linkParsedPath = ypath.YPath.clone(this.parsedPath).concat('&');
            this.linkPathState = prepareNavigationState(this.linkParsedPath, transaction);
            this.targetPath = attributes.target_path;
            this.targetPathBroken = attributes.broken;
            this.targetPathState = this.targetPath
                ? prepareNavigationState(
                      ypath.YPath.create(this.targetPath, 'absolute'),
                      transaction,
                  )
                : undefined;
        }

        // TABLE
        if (this.type === 'table') {
            this.dynamic = attributes.dynamic;
            this.rows = attributes.row_count;
            this.unmergedRows = attributes.unmerged_row_count;
            this.chunkRows = attributes.chunk_row_count;
            this.iconType = this.dynamic ? 'table_dynamic' : 'table';

            if (this.dynamic) {
                this.tabletState = attributes.tablet_state;
            }
        }
    }
}
