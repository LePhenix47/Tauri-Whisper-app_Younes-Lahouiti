import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadModel,
  getModelsDir,
  listDownloadedModels,
  testWhisper,
  type ModelName,
} from "@api/models";

export function useDownloadModel() {
  return useMutation({
    mutationFn: (modelName: ModelName) => downloadModel(modelName),
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
