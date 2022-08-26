export default interface Toast {
  show: boolean;
  title: string;
  description: string;
  bgColor: string;
  position: string;
  duration?: number;
  action?: ToastAction;
}

export interface BasicToast {
  title: string;
  description: string;
  bgColor?: string;
  position?: string;
  duration?: number;
}

interface ToastAction {
  type: string;
  method: any;
}
