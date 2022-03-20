/**
 * Represents some service that should be initialized before the server
 * goes live. Every service has an init promise to allow the service
 * to initialize.
 */
export interface BackendService {
    init: () => Promise<void>
}