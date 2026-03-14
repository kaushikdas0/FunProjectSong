import { useState, useCallback, useRef } from "react";
import { getModelName, createModel } from "../lib/firebase";

export type ComplimentState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "streaming"; name: string; compliment: string }
  | { status: "result"; name: string; compliment: string }
  | { status: "error" };

export function useCompliment() {
  const [state, setState] = useState<ComplimentState>({ status: "idle" });
  const isFlyingRef = useRef(false); // debounce: prevents double-fire

  const generate = useCallback(async (name: string) => {
    if (isFlyingRef.current) return; // debounce guard
    isFlyingRef.current = true;
    setState({ status: "generating" });

    try {
      const modelName = await getModelName();
      const model = createModel(modelName);
      const result = await model.generateContentStream(
        `Generate a compliment for: ${name}`
      );

      let accumulated = "";
      for await (const chunk of result.stream) {
        accumulated += chunk.text();
        setState({ status: "streaming", name, compliment: accumulated });
      }

      setState({ status: "result", name, compliment: accumulated.trim() });
    } catch (err) {
      console.error("[EgoBoost] Compliment generation failed:", err);
      setState({ status: "error" });
    } finally {
      isFlyingRef.current = false;
    }
  }, []);

  return { state, generate };
}
