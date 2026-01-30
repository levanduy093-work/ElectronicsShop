import { InteractionManager } from 'react-native';
import { cacheManager } from '../utils/cache';

type Fetcher<T> = () => Promise<T>;

interface PrefetchTask {
    key: string;
    fetcher: Fetcher<any>;
    ttl?: number;
    priority?: 'high' | 'low';
}

class PrefetchService {
    private queue: PrefetchTask[] = [];
    private isRunning = false;
    private processedKeys = new Set<string>();

    /**
     * Add a task to the prefetch queue.
     * Checks if the key is already cached or queued before adding.
     */
    async addTask(key: string, fetcher: Fetcher<any>, ttl?: number, priority: 'high' | 'low' = 'low') {
        if (this.processedKeys.has(key)) return;

        // specific check: if cache exists and is valid, don't prefetch
        const cached = await cacheManager.get(key);
        if (cached) {
            this.processedKeys.add(key);
            return; // Already have it
        }

        const task: PrefetchTask = { key, fetcher, ttl, priority };

        if (priority === 'high') {
            this.queue.unshift(task);
        } else {
            this.queue.push(task);
        }

        // Start processing if not already
        this.processQueue();
    }

    /**
     * Batch add tasks
     */
    async addTasks(tasks: { key: string; fetcher: Fetcher<any>; ttl?: number }[]) {
        tasks.forEach(t => this.addTask(t.key, t.fetcher, t.ttl));
    }

    private async processQueue() {
        if (this.isRunning || this.queue.length === 0) return;

        this.isRunning = true;

        // Use InteractionManager to run tasks only after animations/interactions are done
        InteractionManager.runAfterInteractions(async () => {
            while (this.queue.length > 0) {
                const task = this.queue.shift();
                if (!task) break;

                // Double check cache before running (in case it was filled recently)
                const cached = await cacheManager.get(task.key);
                if (cached) {
                    this.processedKeys.add(task.key);
                    continue;
                }

                try {
                    // fetch
                    // console.log(`[Prefetch] Starting: ${task.key}`);
                    const data = await task.fetcher();
                    if (data) {
                        await cacheManager.set(task.key, data, task.ttl);
                        this.processedKeys.add(task.key);
                        // console.log(`[Prefetch] Completed: ${task.key}`);
                    }
                } catch (error) {
                    console.warn(`[Prefetch] Failed: ${task.key}`, error);
                }

                // Small delay between requests to be nice to the thread/network
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            this.isRunning = false;
        });
    }
}

export const prefetchService = new PrefetchService();
