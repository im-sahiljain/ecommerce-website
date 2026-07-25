import { Queue } from 'bullmq';
import { redisClient } from '../middleware/redisCache';
import { OrderItem } from '../db';

export interface OrderJobData {
  orderId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
}

export const ORDER_QUEUE_NAME = 'checkout-order-processing';

// Initialize BullMQ Producer Queue with shared connection options
export const orderQueue = new Queue<OrderJobData>(ORDER_QUEUE_NAME, {
  // @ts-ignore
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});
