import {erasureReplication as erasureReplicationBase} from '@ytsaurus/components';
import UIFactory from '../../../UIFactory';

export {default as main} from './main';
export {metaTablePresetSize as size} from '@ytsaurus/components';
export {compression} from '@ytsaurus/components';

export function erasureReplication(attributes: Parameters<typeof erasureReplicationBase>[0]) {
    return erasureReplicationBase(attributes, {
        docsUrls: UIFactory.docsUrls,
    });
}
