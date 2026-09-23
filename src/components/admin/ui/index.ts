/**
 * FLOWBASE Admin UI Design System & Component Library
 *
 * Mọi trang admin và components từ nay CHỈ CẦN IMPORT TỪ ĐÂY:
 *   import { Button, Input, FormField, Modal, Drawer, StatusBadge, DataTable, PageHeader } from '@/components/admin/ui';
 *
 * Giúp giao diện luôn đồng bộ và không bao giờ phải viết lại lắt nhắt!
 */

// 1. Interactive Primitives
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// 2. Form Controls
export { FormField, Input, Select, Textarea, MoneyInput } from './FormControls';
export type {
  FormFieldProps,
  InputProps,
  SelectProps,
  SelectOption,
  TextareaProps,
  MoneyInputProps,
} from './FormControls';

export { Combobox } from './Combobox';
export type { ComboboxProps } from './Combobox';

// 3. Overlays & Dialogs
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

export { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from './Drawer';
export type { DrawerProps, DrawerSize } from './Drawer';

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { ToastProvider, useToast } from './Toast';

// 4. Data Display & Structure (Re-exported from existing admin components)
export { default as DataTable } from '../DataTable';
export type { Column } from '../DataTable';

export { default as KpiCard } from '../KpiCard';
export { default as PageHeader } from '../PageHeader';
export { default as StatusBadge } from '../StatusBadge';
export { default as Toolbar } from '../Toolbar';
export { default as EmptyState } from '../EmptyState';
