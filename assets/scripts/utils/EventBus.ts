type EventCallback = (...args: any[]) => void;

export default class EventBus {
    private static _listeners: Map<string, EventCallback[]> = new Map();

    static on(event: string, callback: EventCallback): void {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event)!.push(callback);
    }

    static off(event: string, callback: EventCallback): void {
        const callbacks = this._listeners.get(event);
        if (!callbacks) {
            return;
        }
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    static emit(event: string, ...args: any[]): void {
        const callbacks = this._listeners.get(event);
        if (!callbacks) {
            return;
        }
        for (const cb of [...callbacks]) {
            cb(...args);
        }
    }

    static clear(): void {
        this._listeners.clear();
    }
}
