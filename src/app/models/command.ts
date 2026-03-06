export interface Command {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  canExecute?: boolean;
  action: () => void;
}
