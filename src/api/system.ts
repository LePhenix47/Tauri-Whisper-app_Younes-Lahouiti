import { invokeCommand } from "./client";

export type GpuInfo = {
  has_vulkan: boolean;
  vulkan_version: string | null;
  gpu_name: string | null;
  vendor: string | null;
};

/**
 * Get system GPU information
 * @returns GPU details including Vulkan support
 */
export async function getGpuInfo(): Promise<GpuInfo> {
  return invokeCommand<GpuInfo>("get_gpu_info");
}
