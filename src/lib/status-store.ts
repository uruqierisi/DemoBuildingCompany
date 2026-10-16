import { useSyncExternalStore } from 'react';
import type { ApartmentStatus } from '@/data/types';
import { NO_OVERRIDES, parseStatusOverrides, withStatus, type StatusOverrides } from './status-overrides';

/**
 * The demo admin's status changes, kept in localStorage and shared by every component through
 * useSyncExternalStore: a change applies to the whole site at once, and to other tabs of the same
 * browser via the storage event. Only active in demo builds; otherwise the data is used as published.
 */
const STORAGE_KEY = 'pozhegu-demo:apartment-status:v1';

let current: StatusOverrides | null = null;
const listeners = new Set<() => void>();

function readStorage(): StatusOverrides {
  if (!__DEMO_MODE__) return NO_OVERRIDES;
  try {
    return parseStatusOverrides(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    // Storage blocked (private mode, site data disabled): fall back to the published data.
    if (import.meta.env.DEV) console.error('Demo status storage unavailable:', error);
    return NO_OVERRIDES;
  }
}

function getSnapshot(): StatusOverrides {
  if (current === null) current = readStorage();
  return current;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function write(next: StatusOverrides): void {
  current = next;
  try {
    if (Object.keys(next).length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Not persisted, but the change still applies in this tab until reload.
    if (import.meta.env.DEV) console.error('Demo status change not saved:', error);
  }
  notify();
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  current = readStorage();
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', handleStorage);
  };
}

export function useStatusOverrides(): StatusOverrides {
  return useSyncExternalStore(subscribe, getSnapshot, () => NO_OVERRIDES);
}

export function setApartmentStatus(apartmentId: string, status: ApartmentStatus, baseStatus: ApartmentStatus): void {
  if (!__DEMO_MODE__) return;
  write(withStatus(getSnapshot(), apartmentId, status, baseStatus));
}

export function resetApartmentStatuses(): void {
  if (!__DEMO_MODE__) return;
  write(NO_OVERRIDES);
}
