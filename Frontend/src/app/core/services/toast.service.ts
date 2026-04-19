import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DEFAULT_TTL = 4000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private counter = 0;

  success(message: string, ttl = DEFAULT_TTL): void {
    this.push(message, 'success', ttl);
  }
  error(message: string, ttl = DEFAULT_TTL + 2000): void {
    this.push(message, 'error', ttl);
  }
  info(message: string, ttl = DEFAULT_TTL): void {
    this.push(message, 'info', ttl);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(message: string, variant: ToastVariant, ttl: number): void {
    const id = ++this.counter;
    this._toasts.update((list) => [...list, { id, message, variant }]);
    if (ttl > 0) setTimeout(() => this.dismiss(id), ttl);
  }
}
