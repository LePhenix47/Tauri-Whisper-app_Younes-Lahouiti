import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  downloadModel,
  getModelsDir,
  listDownloadedModels,
  testWhisper,
  type ModelName,
} from "@api/models";

export function useDownloadModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelName: ModelName) => downloadModel(modelName),
    onSuccess: async (message) => {
      // Only invalidate if the download actually succeeded (not if model already existed)
      if (message.includes("Successfully downloaded")) {
        // Add a small delay to ensure file is fully written to disk before refetching
        await new Promise((resolve) => setTimeout(resolve, 500));
        await queryClient.invalidateQueries({ queryKey: ["downloadedModels"] });
      }
    },
  });
}

export function useModelsDir() {
  return useQuery({
    queryKey: ["modelsDir"],
    queryFn: getModelsDir,
  });
}

export function useListModels() {
  return useQuery({
    queryKey: ["downloadedModels"],
    queryFn: listDownloadedModels,
  });
}

export function useTestWhisper() {
  return useMutation({
    mutationFn: (modelName: ModelName) => testWhisper(modelName),
  });
}
