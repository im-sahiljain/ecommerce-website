import { Worker, Job } from 'bullmq';
import { redisClient } from '../middleware/redisCache';
import { ORDER_QUEUE_NAME, OrderJobData } from './orderQueue';

export function initOrderWorker() {
  const worker = new Worker<OrderJobData>(
    ORDER_QUEUE_NAME,
    async (job: Job<OrderJobData>) => {
      const { orderId, customerName, customerEmail, totalAmount } = job.data;
      console.log(`[BULLMQ WORKER] Processing Order background tasks for ${orderId}`);

      // Decoupled async tasks executed outside HTTP main thread loop:
      // 1. Send Transactional Confirmation Email
      await simulateTask(`Sending transactional email to ${customerEmail}`);

      // 2. Generate PDF Invoice Document
      await simulateTask(`Generating digital receipt for Order #${orderId} (Total: $${totalAmount})`);

      // 3. Sync ERP Inventory Webhook
      await simulateTask(`Updating ERP inventory stock levels for Order ${orderId}`);

      console.log(`[BULLMQ WORKER] Completed background processing for ${orderId}`);
    },
    {
      // @ts-ignore
      connection: redisClient,
      concurrency: 10,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[BULLMQ WORKER ERROR] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

function simulateTask(label: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
}
