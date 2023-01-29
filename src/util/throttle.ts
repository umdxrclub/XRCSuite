/**
 * A throttle allows you to control the rate at which functions are executed.
 */
export class Throttle {

    private _intervalMs: number
    private _executeTimeout: NodeJS.Timeout | null = null
    private _pendingExecFunction: () => void | null = null;

    constructor(intervalMs: number) {
        this._intervalMs = intervalMs;
    }

    /**
     * Executes a given function. If no function has been recently executed (determined
     * by the throttle's interval), then it is executed immediately. Otherwise, it
     * is queued to be executed at the next interval. If there is already a pending
     * function to be executed, the previous will be dismissed and the new one will
     * be executed instead.
     *
     * @param fn The function to execute.
     */
    public exec(fn: () => void) {
        if (this._executeTimeout) {
            this._pendingExecFunction = fn;
        } else {
            fn();
            this._executeTimeout = setTimeout(this._execAndClearTimeout.bind(this), this._intervalMs)
        }
    }

    private _execAndClearTimeout() {
        if (this._pendingExecFunction) {
            this._pendingExecFunction()
            this._pendingExecFunction = null;
        }

        this._executeTimeout = null;
    }

    public static wait(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }
}