import { autoGenerateClimate } from "./climateMonitoringService";
import { initializeClimateData } from "./climateSeeder";

let schedulerInterval = null;

// Start scheduler - runs every hour
export const startClimateScheduler = async () => {
  if (schedulerInterval) return; // Already running

  // Initialize data on first run
  await initializeClimateData();

  // Run immediately on startup
  await autoGenerateClimate();

  // Run every hour (3600000 ms)
  schedulerInterval = setInterval(() => {
    autoGenerateClimate();
  }, 3600000);
};

// Stop scheduler
export const stopClimateScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

// Manual trigger for testing
export const triggerClimateGeneration = async () => {
  await autoGenerateClimate();
};
