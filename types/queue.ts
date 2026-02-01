import { Purpose } from "./purpose";

export type Queue = {
    id: string;
    stationId: string;
    counterId?: string;
    queueNumber: string;
    purpose: Purpose;
    customerEmail: string;
    status: string;
    position: number;
    estimatedWaitTime: number | string;
    qrId?: string;
    createdAt?: string;
    servedAt?: string;
    servedBy?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancelledBy?: string;
  };