import { useState, useCallback, useRef } from "react";
import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";

interface UseStreamingRequestOptions {
  endpoint: string;
}

export function useStreamingRequest({ endpoint }: UseStreamingRequestOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (body: Record<string, string>) => {
      setIsLoading(true);
      setResult("");
      setError(null);

      abortRef.current = new AbortController();

      try {
        const baseUrl = getApiUrl();
        const url = new URL(endpoint, baseUrl);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.error) throw new Error(data.error);
              if (data.content) {
                accumulated += data.content;
                setResult(accumulated);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "An error occurred");
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [endpoint],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setResult("");
    setError(null);
  }, []);

  return { isLoading, result, error, execute, cancel, reset };
}
