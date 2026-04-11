import { Kpi } from '@/types';

export const mockKpis: Kpi[] = [
  { id: 'kpi-1', name: 'Tasks Today',  value: 5,  trend: 'up' },
  { id: 'kpi-2', name: 'Deadlines',    value: 3,  trend: 'flat' },
  { id: 'kpi-3', name: 'Goal',         value: 67, unit: '%', trend: 'up' },
  { id: 'kpi-4', name: 'Risk',         value: 2,  trend: 'down' },
];
