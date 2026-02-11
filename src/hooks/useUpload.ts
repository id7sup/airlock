"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  getPresignedUploadUrlAction,
  confirmFileUploadAction,
} from "@/lib/actions/files";

// --- Types ---

export type UploadFileStatus =
  | "pending"
  | "uploading"
  | "success"
  | "error"
  | "stalled";

export interface UploadFileEntry {
  id: string;
  name: string;
  size: number;
  file: File;
  progress: number; // 0-100
  status: UploadFileStatus;
  error?: string;
  targetFolderId: string;
  lastProgressTime: number;
}

const CONCURRENCY = 3;
const STALL_THRESHOLD_MS = 10_000;
const SESSION_KEY = "airlock_upload_active";

// --- XHR upload with byte-level progress ---

function uploadWithXHR(
  url: string,
  file: File,
  contentType: string,
  onProgress: (loaded: number, total: number) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const onAbort = () => {
      xhr.abort();
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    if (abortSignal) {
      if (abortSignal.aborted) {
        reject(new DOMException("Upload aborted", "AbortError"));
        return;
      }
      abortSignal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      abortSignal?.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      abortSignal?.removeEventListener("abort", onAbort);
      reject(new Error("Erreur réseau pendant l'upload"));
    };

    xhr.ontimeout = () => {
      abortSignal?.removeEventListener("abort", onAbort);
      reject(new Error("Upload timeout"));
    };

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

// --- Concurrency runner ---

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const i = index++;
      try {
        const value = await tasks[i]();
        results[i] = { status: "fulfilled", value };
      } catch (reason: any) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// --- Hook ---

export function useUpload() {
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [interruptedUpload, setInterruptedUpload] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const filesRef = useRef<UploadFileEntry[]>([]);

  // Keep ref in sync for use inside callbacks
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Check for interrupted upload on mount
  useEffect(() => {
    try {
      const wasUploading = sessionStorage.getItem(SESSION_KEY);
      if (wasUploading === "true") {
        setInterruptedUpload(true);
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  }, []);

  // Track active upload in sessionStorage + beforeunload warning
  useEffect(() => {
    if (isUploading) {
      try { sessionStorage.setItem(SESSION_KEY, "true"); } catch {}

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    } else {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    }
  }, [isUploading]);

  // Stall detection
  useEffect(() => {
    if (!isUploading) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setFiles((prev) =>
        prev.map((f) => {
          if (
            f.status === "uploading" &&
            f.lastProgressTime &&
            now - f.lastProgressTime > STALL_THRESHOLD_MS
          ) {
            return { ...f, status: "stalled" as const };
          }
          if (
            f.status === "stalled" &&
            f.lastProgressTime &&
            now - f.lastProgressTime <= STALL_THRESHOLD_MS
          ) {
            return { ...f, status: "uploading" as const };
          }
          return f;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isUploading]);

  // Core: upload a single file entry
  const uploadSingleFile = useCallback(
    async (entry: UploadFileEntry, signal?: AbortSignal) => {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: "uploading", progress: 0, lastProgressTime: Date.now() }
            : f
        )
      );

      try {
        // Lazy presigned URL (just-in-time, avoids expiration)
        const { uploadUrl, s3Key } = await getPresignedUploadUrlAction({
          name: entry.name,
          size: entry.size,
          mimeType: entry.file.type,
          folderId: entry.targetFolderId,
        });

        // Upload with XHR for byte-level progress
        await uploadWithXHR(
          uploadUrl,
          entry.file,
          entry.file.type || "application/octet-stream",
          (loaded, total) => {
            const progress = Math.round((loaded / total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === entry.id
                  ? { ...f, progress, lastProgressTime: Date.now(), status: "uploading" }
                  : f
              )
            );
          },
          signal
        );

        // Mark success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: "success", progress: 100 } : f
          )
        );

        // Confirm in background (non-blocking)
        confirmFileUploadAction({
          name: entry.name,
          size: entry.size,
          mimeType: entry.file.type,
          s3Key,
          folderId: entry.targetFolderId,
        }).catch((err) =>
          console.error(`Erreur confirmation pour ${entry.name}:`, err)
        );
      } catch (error: any) {
        if (error?.name === "AbortError") {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, status: "error", error: "Annulé" }
                : f
            )
          );
          return;
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: "error",
                  error: error?.message || "Erreur inconnue",
                }
              : f
          )
        );
      }
    },
    []
  );

  // Upload a batch of files
  const uploadFiles = useCallback(
    async (fileList: File[], targetFolderId: string) => {
      if (fileList.length === 0) return;

      const controller = abortControllerRef.current || new AbortController();
      if (!abortControllerRef.current) {
        abortControllerRef.current = controller;
      }

      const entries: UploadFileEntry[] = fileList.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        file,
        progress: 0,
        status: "pending" as const,
        targetFolderId,
        lastProgressTime: Date.now(),
      }));

      setFiles((prev) => [...prev, ...entries]);
      setIsUploading(true);

      const tasks = entries.map(
        (entry) => () => uploadSingleFile(entry, controller.signal)
      );

      await runWithConcurrency(tasks, CONCURRENCY);

      // Check if all files are done
      const current = filesRef.current;
      const stillActive = current.some(
        (f) => f.status === "pending" || f.status === "uploading"
      );
      if (!stillActive) setIsUploading(false);
    },
    [uploadSingleFile]
  );

  // Add more files to an ongoing upload session
  const addFiles = useCallback(
    async (fileList: File[], targetFolderId: string) => {
      if (fileList.length === 0) return;

      const controller = abortControllerRef.current || new AbortController();
      if (!abortControllerRef.current) {
        abortControllerRef.current = controller;
      }

      const entries: UploadFileEntry[] = fileList.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        file,
        progress: 0,
        status: "pending" as const,
        targetFolderId,
        lastProgressTime: Date.now(),
      }));

      setFiles((prev) => [...prev, ...entries]);
      setIsUploading(true);

      const tasks = entries.map(
        (entry) => () => uploadSingleFile(entry, controller.signal)
      );

      await runWithConcurrency(tasks, CONCURRENCY);

      const current = filesRef.current;
      const stillActive = current.some(
        (f) => f.status === "pending" || f.status === "uploading"
      );
      if (!stillActive) setIsUploading(false);
    },
    [uploadSingleFile]
  );

  // Retry a single failed file
  const retryFile = useCallback(
    async (fileId: string) => {
      const entry = filesRef.current.find((f) => f.id === fileId);
      if (!entry || (entry.status !== "error" && entry.status !== "stalled"))
        return;

      const controller = abortControllerRef.current || new AbortController();
      if (!abortControllerRef.current) {
        abortControllerRef.current = controller;
      }

      setIsUploading(true);
      await uploadSingleFile(
        { ...entry, status: "pending", progress: 0, error: undefined },
        controller.signal
      );

      const current = filesRef.current;
      const stillActive = current.some(
        (f) => f.status === "pending" || f.status === "uploading"
      );
      if (!stillActive) setIsUploading(false);
    },
    [uploadSingleFile]
  );

  // Retry all failed files
  const retryFailed = useCallback(async () => {
    const failedEntries = filesRef.current.filter(
      (f) => f.status === "error" || f.status === "stalled"
    );
    if (failedEntries.length === 0) return;

    const controller = abortControllerRef.current || new AbortController();
    if (!abortControllerRef.current) {
      abortControllerRef.current = controller;
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "error" || f.status === "stalled"
          ? { ...f, status: "pending" as const, progress: 0, error: undefined }
          : f
      )
    );

    setIsUploading(true);

    const tasks = failedEntries.map(
      (entry) => () =>
        uploadSingleFile(
          { ...entry, status: "pending", progress: 0, error: undefined },
          controller.signal
        )
    );

    await runWithConcurrency(tasks, CONCURRENCY);

    const current = filesRef.current;
    const stillActive = current.some(
      (f) => f.status === "pending" || f.status === "uploading"
    );
    if (!stillActive) setIsUploading(false);
  }, [uploadSingleFile]);

  // Cancel all uploads
  const cancelAll = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsUploading(false);
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setFiles([]);
    setIsUploading(false);
  }, []);

  // Dismiss interrupted upload notification
  const dismissInterrupted = useCallback(() => {
    setInterruptedUpload(false);
  }, []);

  // Computed values
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const uploadedSize = files.reduce(
    (acc, f) => acc + (f.size * f.progress) / 100,
    0
  );
  const overallProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
  const completedCount = files.filter((f) => f.status === "success").length;
  const totalCount = files.length;

  return {
    files,
    isUploading,
    interruptedUpload,
    overallProgress,
    completedCount,
    totalCount,
    totalSize,
    uploadedSize,
    uploadFiles,
    addFiles,
    retryFile,
    retryFailed,
    cancelAll,
    reset,
    dismissInterrupted,
  };
}
