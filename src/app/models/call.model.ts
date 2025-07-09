export interface CallInfo {
  id?: string;
  phoneNumber: string;
  customerName?: string;
  status: CallStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
  direction: 'inbound' | 'outbound';
}

export enum CallStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  IN_PROGRESS = 'in-progress',
  HOLD = 'hold',
  ENDED = 'ended',
  FAILED = 'failed'
}