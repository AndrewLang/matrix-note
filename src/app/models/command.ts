export interface Command {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  active?: boolean;
  canExecute?: boolean;
  action: () => void;
}
