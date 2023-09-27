//import {Worker} from '@gravity-ui/app-builder/worker';

export function getBasicLayoutWorker() {
    console.log(new URL('./layout.worker.ts'));
    return new Worker(new URL('./layout.worker.ts'));
}
