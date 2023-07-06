import Toast from "@/elements/Toast";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

interface ToastContext {
  toast: (title: string, message: string) => void;
}

export const ToastContext = createContext<ToastContext>({
  toast: () => {},
});

interface ToastConfig {
  title: string;
  message: string;
}

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  function addToast(title: string, message: string) {
    setToasts((toasts) => [...toasts, { title, message }]);
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={`toast-${index}`}
          title={toast.title}
          description={toast.message}
        />
      ))}
    </ToastContext.Provider>
  );
};

export function useToast() {
  return useContext(ToastContext);
}
