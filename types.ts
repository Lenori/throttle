export type Task = () => Promise<number>;
export type StatusTypes = 'idle' | 'working';

export interface WorkerStatus {
    promise: Promise<number> | null;
    status: StatusTypes;
}

export interface WorkerCallbackProps {
    result: number;
    workerIndex: number;
    taskIndex: number;
}
