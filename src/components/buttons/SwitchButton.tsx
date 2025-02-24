"use client";
import React, { useEffect, useState } from "react";

export function SwitchButton({
  checked,
  setChecked,
  defaultChecked = false,
  disabled = false,
  className = "",
}: {
  checked?: boolean;
  setChecked: (isChecked: boolean) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [internalChecked, setInternalChecked] = useState(
    checked ?? defaultChecked,
  );

  function handleToggle() {
    if (disabled) return;
    setChecked(!internalChecked);
    setInternalChecked(!internalChecked);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={internalChecked}
      data-state={internalChecked ? "checked" : "unchecked"}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        inline-flex h-[2rem] w-[4rem] cursor-pointer shadow-[0px_4px_12px_rgba(0,0,0,0.07)]
        rounded-3xl bg-fg/[0.15] p-1.5
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
    >
      <span
        className={`
          pointer-events-none block h-full aspect-square rounded-full
          bg-accent shadow-lg ring-0 transition-transform duration-200
          ${internalChecked ? "translate-x-[2rem]" : "translate-x-0"}
        `}
      />
    </button>
  );
}
