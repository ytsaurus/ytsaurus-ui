// An object containing the exposed functions (see `expose`)
type ExposedFunctions = Record<string, (...args: any[]) => any>;

/** Message sent to the worker */
type Request = {
    // job id
    id: number;
    // Function to execute
    action: string;
    // Arguments to pass to function
    payload: unknown[];
};

/** Message received from the worker */
type Response = {
    // job id
    id: number;
    // result status
    type: 'success' | 'error';
    // e.g. the execution result / caught error
    payload: unknown;
};

/** The wrapper used to interface with the worker. It has an async wrapper function for
 *  every exposed function, and a `terminate` function to kill the worker
 */
export type PromisifiedWorker<T extends ExposedFunctions> = {
    // Make all functions in T return promises
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
        ? (...args: Args) => Result extends Promise<unknown> ? Result : Promise<Result>
        : never;
} & {terminate: () => void};

/**
 * Expose a set of functions to be callable from the master thread via a PromiseWorker wrapper
 * (see `wrap`)
 * @param [functions] An object whose entries are the functions to be exposed
 */
export function expose(functions: ExposedFunctions): void {
    // Ensure we are running in a worker
    // @ts-ignore
    if (typeof WorkerGlobalScope === 'undefined') {
        console.error('Expose not called in worker thread');
        return;
    }

    function onSuccess(request: Request, result: unknown) {
        postMessage({
            id: request.id,
            type: 'success',
            payload: result,
        } as Response);
    }

    function onError(request: Request, error: unknown) {
        postMessage({id: request.id, type: 'error', payload: error} as Response);
    }

    // Returns a list of names of all exposed functions
    const getFunctionality = function () {
        return Object.keys(functions).filter((key) => typeof functions[key] === 'function');
    };

    // Executes the function corresponding to a request and returns a promise of the result
    function exec(request: Request): Promise<unknown> {
        const func = functions[request.action];
        const args = request.payload;

        const result = func(...args) as unknown;

        if (result instanceof Promise) {
            return result;
        }

        return Promise.resolve(result);
    }

    self.onmessage = async function (message: MessageEvent<Request>) {
        const request = message.data;
        // We must catch any errors so we can match them to a request
        try {
            let result: unknown;
            if (request.action === 'getFunctionality') {
                result = getFunctionality();
            } else {
                result = await exec(request);
            }
            onSuccess(request, result);
        } catch (e) {
            onError(request, e);
        }
    };
}

// Takes in an exposed worker, returns the PromiseWorker wrapper used to interact with it
export async function promisifyWorker<T extends ExposedFunctions>(
    worker: Worker,
): Promise<PromisifiedWorker<T>> {
    type Job = {
        request: Request;
        resolve: (value: unknown) => void;
        reject: (reason?: unknown) => void;
    };

    let jobId = 0;
    const activeJobs: Job[] = [];

    // Creates and runs a new job, returns a promise for it's result
    function createJob(temp: Pick<Request, 'action' | 'payload'>) {
        const request = {...temp, id: jobId++};
        const jobResult = new Promise((resolve, reject) => {
            activeJobs.push({request, resolve, reject});
        });
        worker.postMessage(request);

        return jobResult;
    }

    worker.onmessage = function (message: MessageEvent<Response>) {
        const response = message.data;

        const jobIndex = activeJobs.findIndex((job) => job.request.id === response.id);

        if (jobIndex < 0) {
            console.error('Worker responded to nonexistent job');
            console.warn("Worker's response:", response);
            return;
        } else {
            const job = activeJobs.splice(jobIndex, 1)[0];
            if (response.type === 'success') {
                job.resolve(response.payload);
            } else {
                job.reject(response.payload);
            }
        }
    };

    worker.onerror = function (error) {
        // We don't actually know what job the error occured in, so reject them all just to be safe.
        // This event should never fire since we have a try catch within the worker's onmessage
        console.error('Uncaught error in worker:', error);

        const jobs = activeJobs.splice(0, activeJobs.length);
        jobs.forEach((job) => job.reject(error));
    };

    /// Create the wrapper
    // Obtain a list of functions available in the worker
    const functionality = (await createJob({
        action: 'getFunctionality',
        payload: [],
    })) as string[];

    // Create proxy functions for these
    const wrapper = {} as ExposedFunctions;
    for (const name of functionality) {
        wrapper[name] = (...args: unknown[]) => createJob({action: name, payload: args});
    }

    // Add the termination function
    wrapper.terminate = () => worker.terminate();

    return wrapper as PromisifiedWorker<T>;
}
