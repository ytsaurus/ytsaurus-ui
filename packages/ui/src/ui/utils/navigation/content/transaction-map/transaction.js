import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {prepareNavigationState} from '../../../../utils/navigation';

export default class Transaction {
    constructor(transaction, parentParsedPath) {
        this.id = ypath.getValue(transaction, '');
        this.attributes = ypath.getValue(transaction, '/@');

        this.type = this.attributes.type;
        this.title = this.attributes.title;
        this.owner = this.attributes.owner;
        this.started = this.attributes.start_time;

        this.parsedPath = ypath.YPath.clone(parentParsedPath).concat(
            '/' + ypath.YPath.fragmentFromYSON(this.id),
        );
        this.pathState = prepareNavigationState(this.parsedPath);
        this.path = this.parsedPath.stringify();
    }
}
