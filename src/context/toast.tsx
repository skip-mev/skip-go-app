import Toast from "@/elements/Toast";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

interface ToastContext {
  toast: (title: string, message: string, type: "success" | "error") => void;
}

export const ToastContext = createContext<ToastContext>({
  toast: () => {},
});

interface ToastConfig {
  title: string;
  message: string;
  type: "success" | "error";
}

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  function addToast(
    title: string,
    message: string,
    type: "success" | "error" = "error"
  ) {
    setToasts((toasts) => [...toasts, { title, message, type }]);
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={`toast-${index}`}
          title={toast.title}
          description={toast.message}
          type={toast.type}
        />
      ))}
    </ToastContext.Provider>
  );
};

export function useToast() {
  return useContext(ToastContext);
}
