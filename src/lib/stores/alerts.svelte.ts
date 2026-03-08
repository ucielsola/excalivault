import browser from "webextension-polyfill";

export type AlertType = "success" | "error" | "info" | "warning";

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

class AlertsStore {
  #alerts = $state<Alert[]>([]);

  addAlert(type: AlertType, message: string, duration = 3000): void {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const alert: Alert = { id, type, message, duration };
    
    this.#alerts = [...this.#alerts, alert];

    if (duration > 0) {
      setTimeout(() => {
        this.removeAlert(id);
      }, duration);
    }
  }

  removeAlert(id: string): void {
    this.#alerts = this.#alerts.filter((a) => a.id !== id);
  }

  success(message: string, duration?: number): void {
    this.addAlert("success", message, duration);
  }

  error(message: string, duration?: number): void {
    this.addAlert("error", message, duration);
  }

  info(message: string, duration?: number): void {
    this.addAlert("info", message, duration);
  }

  warning(message: string, duration?: number): void {
    this.addAlert("warning", message, duration);
  }

  get alerts(): Alert[] {
    return this.#alerts;
  }
}

export const alerts = new AlertsStore();
