import { useState, useCallback, useRef } from "react";
import { getModelName, createModel } from "../lib/firebase";

export type ComplimentState =
  | { status: "idle" }
  | { status: "generating" }
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
      const result = await model.generateContent(
        `Generate a compliment for: ${name}`
      );
      const compliment = result.response.text().trim();
      setState({ status: "result", name, compliment });
    } catch {
      // All errors map to a single friendly message — no raw errors surface
      setState({ status: "error" });
    } finally {
      isFlyingRef.current = false;
    }
  }, []);

  return { state, generate };
}
