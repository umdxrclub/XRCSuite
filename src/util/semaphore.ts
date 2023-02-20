export class Semaphore {
    private _maxLocks: number;
    private _numLocks: number;
    private _pendingLockPromises: (() => void)[] = [];
    private _pendingWaits: { until: number, resolve: () => void }[] = []

    constructor(maxLocks: number, initCount: number = 0) {
        this._maxLocks = maxLocks;
        this._numLocks = initCount;
    }

    public numLocks() {
        return this._numLocks;
    }

    public async lock() {
        if (this._numLocks < this._maxLocks) {
            this._numLocks++;
        } else {
            let pendingPromise = new Promise(resolve =>
                this._pendingLockPromises.push(resolve as any));

            await pendingPromise;
        }
    }

    public release() {
        if (this._numLocks > 0) {
            this._numLocks--;
            if (this._pendingLockPromises.length > 0) {
                let resolveFunc = this._pendingLockPromises.splice(0, 1)[0]
                resolveFunc();
            }

            if (this._pendingWaits.length > 0) {
                let newWaits: { until: number, resolve: () => void }[] = []
                let finished: { until: number, resolve: () => void }[] = []
                this._pendingWaits.forEach(pw => {
                    if (pw.until <= this._numLocks) {
                        finished.push(pw)
                    } else {
                        newWaits.push(pw)
                    }
                })

                this._pendingWaits = newWaits;
                finished.forEach(pw => pw.resolve())
            }
        }
    }

    public async wait(untilNumLocks: number = 0) {
        if (this._numLocks > untilNumLocks) {
            let pendingPromise = new Promise(resolve =>
                this._pendingWaits.push({ until: untilNumLocks, resolve: resolve as any }
            ))

            await pendingPromise
        }
    }
}