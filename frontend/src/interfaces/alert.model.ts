export interface Alert {
  sensorId: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  status: 'Open' | 'Investigating' | 'Resolved';
  resolvedBy?: string | null;
  resolutionNote?: string | null;
  resolvedAt?: Date;
}
