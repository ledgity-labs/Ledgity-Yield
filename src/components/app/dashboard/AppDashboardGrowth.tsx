import { Amount, Card, Rate, Spinner } from "@/components/ui";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useGrowthRevenueData } from "@/hooks/subgraph/useGrowthRevenueData";

export const AppDashboardGrowth: React.PropsWithoutRef<typeof Card> = ({
  className,
}) => {
  const [totalGrowth, setTotalGrowth] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { growthData, isDataLoading } = useGrowthRevenueData();

  const computeTotalProfits = () => {
    let _totalRevenue = 0;
    const combination: [number, number][] = [];

    // Loop over all keys in the object
    for (const lTokenSymbol in growthData) {
      // Compute cumulative revenue for this L-Token
      const lTokenTotalRevenue = growthData[lTokenSymbol].reduce(
        (acc, value) => acc + value.revenue,
        0,
      );
      _totalRevenue += lTokenTotalRevenue;

      //  Compute cumulative growth and average balance before for this L-Token
      const cumulativeGrowth = growthData[lTokenSymbol].reduce(
        (acc, val) => acc + val.growth,
        0,
      );
      const averageBalanceBefore =
        growthData[lTokenSymbol].reduce(
          (acc, val) => acc + val.balanceBefore,
          0,
        ) / growthData[lTokenSymbol].length;
      combination.push([averageBalanceBefore, cumulativeGrowth]);
    }

    // Compute total growth
    let total_weight = combination.reduce((acc, val) => acc + val[0], 0);
    let weighted_sum = combination.reduce(
      (acc, val) => acc + val[0] * val[1],
      0,
    );
    let weighted_avg = total_weight !== 0 ? weighted_sum / total_weight : 0;
    setTotalGrowth(weighted_avg);
  };

  useEffect(() => {
    if (!isDataLoading) computeTotalProfits();
  }, [growthData, isDataLoading]);

  if (isDataLoading) return <Spinner />;
  else
    return (
      <Rate
        value={totalGrowth * 100}
        prefix="+"
        isUD7x3={false}
        className={className}
      />
    );
};
