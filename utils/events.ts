type Callback = () => void;

class EventBus {
  private listeners: { [key: string]: Callback[] } = {};

  on(event: string, callback: Callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb());
    }
  }

  off(event: string, callback: Callback) {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback,
    );
  }
}

export const eventBus = new EventBus();
