/**
 * Represents some sort of background service that needs to be initialized
 * before the bot begins operating.
 */
export interface XRCBotService {
    /**
     * Initializes the service and fulfills the promise when the service
     * is ready.
     *
     * @returns Whether the service was successfully initialized.
     */
    init(): Promise<boolean>
}