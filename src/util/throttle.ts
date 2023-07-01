/**
 * A throttle allows you to control the rate at which functions are executed.
 */
export class Throttle {

    private _intervalMs: number
    private _pendingExec: boolean = false
    private _pendingExecFunction: (() => void) | null = null;

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
    public async exec(fn: () => void | Promise<void>) {
        if (this._pendingExec) {
            this._pendingExecFunction = fn;
        } else {
            this._pendingExec = true;

            // Execute function
            await fn();

            // Wait interval
            await Throttle.wait(this._intervalMs);

            if (this._pendingExecFunction) {
                this._pendingExecFunction()
                this._pendingExecFunction = null;
            }

            this._pendingExec = false;
        }
    }

    public static wait(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }
}