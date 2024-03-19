import 'dotenv/config';
import debug from 'debug';
import type { Task, WorkerStatus } from './types';

const logger = debug('core');

const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);

const load = delays.map(
    (delay) => (): Promise<number> =>
        new Promise((resolve) => {
            setTimeout(() => resolve(Math.floor(delay / 100)), delay);
        }),
);

const throttle = async (workers: number, tasks: Task[]) => {
    let task_index = 0;

    const results: number[] = [];
    const workers_status: WorkerStatus[] = [];

    for (let i = 0; i < workers; i++) {
        workers_status[i] = {
            promise: null,
            status: 'idle',
        };
    }

    while (task_index < tasks.length) {
        for (let i = 0; i < workers && task_index < tasks.length; i++) {
            if (workers_status[i].status === 'idle') {
                logger(
                    'Worker %i is working on task %i',
                    i + 1,
                    task_index + 1,
                );

                const promise = tasks[task_index]().then((result) => {
                    results.push(result);

                    workers_status[i] = {
                        promise: null,
                        status: 'idle',
                    };

                    logger('Worker %i is now idle', i);
                    return result;
                });

                workers_status[i] = {
                    promise: promise,
                    status: 'working',
                };

                task_index++;
            }
        }

        const promiseArray = workers_status.map((worker) => worker.promise);
        await Promise.race(promiseArray);
    }

    const promiseArray = workers_status.map((worker) => worker.promise);
    await Promise.all(promiseArray);

    return results;
};

const bootstrap = async () => {
    logger('Starting...');
    const start = Date.now();
    const answers = await throttle(5, load);
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
    logger('Answers length: ', answers.length);
};

bootstrap().catch((err) => {
    logger('General fail: %O', err);
});
