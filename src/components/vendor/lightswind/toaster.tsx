"use client";

import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, XIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

export type ToastType = "default" | "success" | "destructive";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastOptions {
  description?: string;
  type?: ToastType;
  duration?: number;
}

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 5000;

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function dismissToast(id: number): void {
  items = items.filter((item) => item.id !== id);
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
  emit();
}

export function toast(title: string, options?: ToastOptions): void {
  const id = nextId;
  nextId = (nextId + 1) % Number.MAX_SAFE_INTEGER;
  while (items.length >= MAX_TOASTS) {
    const oldest = items[0];
    if (oldest === undefined) break;
    dismissToast(oldest.id);
  }
  items = [
    ...items,
    { id, title, description: options?.description, type: options?.type ?? "default" },
  ];
  emit();
  timers.set(
    id,
    setTimeout(() => dismissToast(id), options?.duration ?? DEFAULT_DURATION),
  );
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return items;
}

/* One shared empty list: React compares snapshots by identity, and a fresh
   `[]` per call reads as "changed" on every hydration pass. */
const SERVER_SNAPSHOT: ToastItem[] = [];

function getServerSnapshot(): ToastItem[] {
  return SERVER_SNAPSHOT;
}

const toastVariants = cva(
  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xs border bg-paper-2 p-4 shadow-card-lift",
  {
    defaultVariants: { type: "default" },
    variants: {
      type: {
        default: "border-line",
        success: "border-line",
        destructive: "border-accent",
      },
    },
  },
);

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <CheckCircle2Icon aria-hidden="true" className="text-gold-deep mt-0.5 size-4 shrink-0" />
    );
  }
  if (type === "destructive") {
    return <AlertCircleIcon aria-hidden="true" className="text-accent mt-0.5 size-4 shrink-0" />;
  }
  return <InfoIcon aria-hidden="true" className="text-muted mt-0.5 size-4 shrink-0" />;
}

export function Toaster({ className = "" }: { className?: string }) {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const prefersReduced = useReducedMotionSafe();

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 ${className}`}
    >
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            role="status"
            className={cn(toastVariants({ type: item.type }))}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: prefersReduced === true ? 0 : 0.2 }}
          >
            <ToastIcon type={item.type} />
            <div className="min-w-0 flex-1">
              <p className="text-ink text-sm font-medium">{item.title}</p>
              {item.description !== undefined && (
                <p className="text-muted mt-1 text-xs font-light">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(item.id)}
              className="rounded-2xs text-muted hover:text-ink shrink-0 cursor-pointer p-1 transition-colors"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
