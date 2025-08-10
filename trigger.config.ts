import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
    project: 'proj_maamohtzvkdkutvuuvek',
    runtime: 'node',
    logLevel: 'log',
    // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
    // You can override this on an individual task.
    // See https://trigger.dev/docs/runs/max-duration
    // Allow up to 2 hours of compute time per task run in dev
    maxDuration: 2 * 60 * 60,
    retries: {
        enabledInDev: true,
        default: {
            // Give flaky external APIs more time between attempts
            maxAttempts: 5,
            minTimeoutInMs: 2_000,
            maxTimeoutInMs: 30_000,
            factor: 2,
            randomize: true
        }
    },
    dirs: ['./trigger']
});
