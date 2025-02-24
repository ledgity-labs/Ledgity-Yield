import { Amount, Card, Spinner } from "@/components/ui";
import React, { useEffect, useState } from "react";
import { useGrowthRevenueData } from "@/hooks/subgraph/useGrowthRevenueData";

export const AppDashboardRevenue: React.PropsWithoutRef<typeof Card> = ({
  className,
}) => {
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
    setTotalRevenue(_totalRevenue);
  };

  useEffect(() => {
    if (!isDataLoading) computeTotalProfits();
  }, [growthData, isDataLoading]);

  if (isDataLoading) return <Spinner />;
  else return <Amount value={totalRevenue} prefix="$" className={className} />;
};
