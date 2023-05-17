import React from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <>
      <article
        className={
          "bg-card-border " + // Must be outside, else twMerge will override it
          twMerge(
            "card", // Used by <CardsHelper />
            "rounded-3xl bg-fg/10 backdrop-blur-md shadow-slate-200 p-[2px] shadow-sm inline-block h-min"
          )
        }
      >
        <div
          className={
            "bg-card-content " + // Must be outside, else twMerge will override it
            twMerge(
              "card",
              "rounded-[1.4rem] bg-indigo-50 backdrop-blur-md",

              // Custom classes
              className
            )
          }
          {...props}
          ref={ref}
        >
          {children}
        </div>
      </article>
    </>
  )
);
Card.displayName = "Card";
export default Card;
