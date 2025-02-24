"use client";
import React, { useState } from "react";

export const RadioButtonGroup = ({
  options = [],
  value = "",
  setValue,
  disabled = false,
  className = "",
  itemClassName = "",
  labelClassName = "",
}: {
  options: { value: string; label?: string }[];
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  function handleChange(value: string) {
    if (disabled) return;
    setSelectedValue(value);
    setValue?.(value);
  }

  return (
    <div className={`${className}`}>
      {options.map((option) => {
        const isChecked = selectedValue === option.value;

        return (
          <div
            key={option.value}
            role="radio"
            aria-checked={isChecked}
            onClick={() => handleChange(option.value)}
            id={option.value}
            data-state={isChecked ? "checked" : "unchecked"}
            className={`rounded-full border-2 border-border font-medium text-primary shadow-[0px_4px_12px_rgba(0,0,0,0.07)] ${isChecked ? "bg-accent font-semibold" : "bg-fg/[0.07] text-fg/50"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${itemClassName}
            `}
          >
            {option.label ? (
              <label
                htmlFor={option.value}
                className={`pointer-events-none ${labelClassName}`}
              >
                {option.label}
              </label>
            ) : (
              isChecked && (
                <div className="flex items-center justify-center">
                  <span className="inline-block aspect-square h-2.5 rounded-full bg-primary text-fg"></span>
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};
