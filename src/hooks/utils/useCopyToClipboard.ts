import { useState, useCallback } from "react";

function oldSchoolCopy(text: string) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

export function useCopyToClipboard() {
  const [state, setState] = useState<string>();

  const copyToClipboard = useCallback((value: string) => {
    const handleCopy = async () => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
          setState(value);
        } else {
          throw new Error("writeText not supported");
        }
      } catch (e) {
        oldSchoolCopy(value);
        setState(value);
      }
    };

    handleCopy();
  }, []);

  return { state, copyToClipboard };
}
