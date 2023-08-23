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

    static prepareTitle(name) {
        return unipika.prettyprint(name, Node.TITLE_PRINT_SETTINGS);
    }

    static prepareCaption(name) {
        return unipika.prettyprint(name, Node.CAPTION_PRINT_SETTINGS);
    }

    static getResource(node, name) {
        return Node.SUPPORTS_RESOURCE_USAGE[ypath.getValue(node, '/@type')]
            ? ypath.getValue(node, '/@resource_usage/' + name)
            : ypath.getValue(node.recursiveResourceUsage, '/' + name);
    }

    constructor(data, params) {
        const node = this;
        const {parsedPath, transaction} = params;

        const name = ypath.getValue(data);
        const attributes = ypath.getAttributes(data);

        node.$value = node.name = name;
        node.$attributes = attributes;

        node.type = attributes.type;
        node.iconType = attributes.type;

        node.title = Node.prepareTitle(node.name);
        node.caption = Node.prepareCaption(node.name);
        node.titleUnquoted = node.title.slice(1, -1);

        try {
            node.parsedPath = ypath.YPath.clone(parsedPath).concat(
                '/' + ypath.YPath.escapeSpecialCharacters(JSON.parse(node.title)),
            );
        } catch (e) {
            node.parsedPath = ypath.YPath.clone(parsedPath).concat(
                '/' + ypath.YPath.escapeSpecialCharacters(node.title),
            );
            node.parsedPathError = {
                message: `Node name cannot be parsed, try to enable 'Escape and highlight' option in your settings. `,
                inner_errors: [e],
            };
        }
        node.path = node.parsedPath.stringify();
        node.pathState = prepareNavigationState(node.parsedPath, transaction);

        // RESOURCES
        node.recursiveResourceUsage = attributes.recursive_resource_usage;

        node.dataWeight = ypath.getValue(node, '/@data_weight');
        node.size = Node.getResource(node, 'disk_space');
        node.sizePerMedium = Node.getResource(node, 'disk_space_per_medium');
        node.chunks = Node.getResource(node, 'chunk_count');
        node.nodes = Node.getResource(node, 'node_count');
        node.tabletStaticMemory = Node.getResource(node, 'tablet_static_memory');
        node.tablets = Node.getResource(node, 'tablet_count');
        node.masterMemory = Node.getResource(node, 'master_memory');

        node.locks = attributes.lock_count;

        node.account = attributes.account;
        node.modified = attributes.modification_time;
        node.created = attributes.creation_time;

        // LINKS
        if (node.type === 'link') {
            node.linkParsedPath = ypath.YPath.clone(node.parsedPath).concat('&');
            node.linkPathState = prepareNavigationState(node.linkParsedPath, transaction);
            node.targetPath = attributes.target_path;
            node.targetPathBroken = attributes.broken;
            node.targetPathState =
                node.targetPath &&
                prepareNavigationState(
                    ypath.YPath.create(node.targetPath, 'absolute'),
                    transaction,
                );
        }

        // TABLE
        if (node.type === 'table') {
            node.dynamic = attributes.dynamic;
            node.rows = attributes.row_count;
            node.unmergedRows = attributes.unmerged_row_count;
            node.chunkRows = attributes.chunk_row_count;
            node.iconType = node.dynamic ? 'table_dynamic' : 'table';

            if (node.dynamic) {
                node.tabletState = attributes.tablet_state;
            }
        }
    }
}
