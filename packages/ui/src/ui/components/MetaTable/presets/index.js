import {erasureReplication as erasureReplicationBase} from '@ytsaurus/components';
import UIFactory from '../../../UIFactory';

export {default as main} from './main';
export {metaTablePresetSize as size} from '@ytsaurus/components';
export {compression} from '@ytsaurus/components';

export function erasureReplication(attributes) {
    return erasureReplicationBase(attributes, {
        docsUrls: UIFactory.docsUrls,
    });
}
