"use client";

/**
 * Componente Toast Mejorado
 * 
 * Características:
 * - Animaciones suaves de entrada/salida
 * - Barra de progreso integrada
 * - Botones de acción
 * - Iconos contextuales
 * - Soporte para dark mode
 */

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import {
  Notification,
  NotificationType,
  notificationManager,
  NOTIFICATION_COLORS,
} from "@/lib/errors/notifications";

// ============================================================================
// ICONS MAP
// ============================================================================

const IconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

// ============================================================================
// SINGLE TOAST COMPONENT
// ============================================================================

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function Toast({ notification, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    id,
    type,
    title,
    description,
    actions,
    dismissible,
    progress,
  } = notification;
  
  const colors = NOTIFICATION_COLORS[type];
  const Icon = IconMap[type];
  
  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  // Manejar dismiss con animación
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  }, [id, onDismiss]);
  
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative overflow-hidden rounded-lg border shadow-lg
        transition-all duration-200 ease-out
        ${colors.bg} ${colors.border}
        ${isVisible && !isExiting 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
        }
        w-full max-w-sm
      `}
    >
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={`h-full transition-all duration-300 ease-out ${colors.icon.replace("text-", "bg-")}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${colors.icon}`}>
            <Icon
              className={`h-5 w-5 ${type === "loading" ? "animate-spin" : ""}`}
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`text-sm font-semibold ${colors.text}`}>
                {title}
              </p>
            )}
            <p className={`text-sm ${title ? "mt-1" : ""} ${colors.text} opacity-90`}>
              {description}
            </p>
            
            {/* Actions */}
            {actions && actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      if (action.variant !== "destructive") {
                        handleDismiss();
                      }
                    }}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-md
                      transition-colors duration-150
                      ${action.variant === "primary"
                        ? `${colors.icon.replace("text-", "bg-")} text-white hover:opacity-90`
                        : action.variant === "destructive"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : `bg-black/5 dark:bg-white/10 ${colors.text} hover:bg-black/10 dark:hover:bg-white/20`
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Dismiss button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={`
                flex-shrink-0 p-1 rounded-md
                transition-colors duration-150
                ${colors.text} opacity-50 hover:opacity-100
                hover:bg-black/5 dark:hover:bg-white/10
              `}
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Error code badge (for debugging) */}
      {notification.meta?.errorCode && process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-1 right-2 text-[10px] opacity-30 font-mono">
          {notification.meta.errorCode}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

export type ToastPosition = 
  | "top-right" 
  | "top-left" 
  | "bottom-right" 
  | "bottom-left"
  | "top-center"
  | "bottom-center";

interface ToastContainerProps {
  position?: ToastPosition;
  maxVisible?: number;
}

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export function ToastContainer({
  position = "bottom-right",
  maxVisible = 5,
}: ToastContainerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const unsubscribe = notificationManager.subscribe((notifs) => {
      setNotifications(notifs.slice(0, maxVisible));
    });
    
    return () => {
      unsubscribe();
    };
  }, [maxVisible]);
  
  const handleDismiss = useCallback((id: string) => {
    notificationManager.dismiss(id);
  }, []);
  
  if (!mounted) return null;
  
  const positionClass = POSITION_CLASSES[position];
  const isBottom = position.startsWith("bottom");
  
  return createPortal(
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className={`
        fixed z-[100] flex flex-col gap-2 pointer-events-none
        ${positionClass}
      `}
      style={{ maxWidth: "min(400px, calc(100vw - 2rem))" }}
    >
      {(isBottom ? [...notifications].reverse() : notifications).map((notification) => (
        <div key={notification.id} className="pointer-events-auto w-full">
          <Toast
            notification={notification}
            onDismiss={handleDismiss}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}

// ============================================================================
// HOOK PARA USO PROGRAMÁTICO
// ============================================================================

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    return notificationManager.subscribe(setNotifications);
  }, []);
  
  return {
    notifications,
    dismiss: notificationManager.dismiss.bind(notificationManager),
    dismissAll: notificationManager.dismissAll.bind(notificationManager),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ToastContainer;
