import { formatAmount, Spinner, formatRate, Amount } from "@/components/ui";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement,
  Tooltip,
  TimeScale,
  TimeSeriesScale,
  LogarithmicScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import { useGrowthRevenueData } from "@/hooks/subgraph/useGrowthRevenueData";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
// Components
import { SwitchButton } from "@/components/buttons/SwitchButton";
import { RadioButtonGroup } from "@/components/buttons/RadioButtonGroup";

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  TimeScale,
  TimeSeriesScale,
  LogarithmicScale,
);

export function AppDashboardChart({ className }: { className?: string }) {
  const { currentAccount, isChangingNetwork } = useWeb3Context();
  const [period, setPeriod] = useState("90");
  const [isGrowthGraph, setIsGrowthGraph] = useState(false);

  const { growthData, isDataLoading, isDataError, dataErrorMessage } =
    useGrowthRevenueData();
  const [labels, setLabels] = useState<Date[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [formattedGrowthData, setFormattedGrowthData] = useState<number[]>([]);

  let delayed: boolean;

  const periodOptions = [
    { value: "7", label: "7D" },
    { value: "30", label: "1M" },
    { value: "90", label: "3M" },
    { value: "365", label: "1Y" },
    { value: "all", label: "All" },
  ];

  function computeLabels() {
    const secondsPerDay = 86400;
    const now = Math.floor(Date.now() / 1000);

    let numberOfDays = 0;
    if (period !== "all") {
      numberOfDays = Number(period);
    } else {
      const investmentStarts = Object.values(growthData)
        .filter((lTokenData) => lTokenData.length > 0)
        .map((lTokenData) => lTokenData[0].timestamp);

      if (investmentStarts.length === 0) {
        return { newLabels: [], chunkTime: 0 };
      }

      const oldestInvestmentStart = Math.min(...investmentStarts);
      numberOfDays = (now - oldestInvestmentStart) / secondsPerDay;
    }

    const startTimestamp = now - numberOfDays * secondsPerDay;

    let nbChunks = 30; // Default
    if (numberOfDays === 7) nbChunks = 7;
    else if (numberOfDays === 30) nbChunks = 10;
    else if (numberOfDays === 90) nbChunks = 12;
    else if (numberOfDays === 365) nbChunks = 15;

    const chunkSize = numberOfDays / nbChunks;
    const chunkTime = chunkSize * secondsPerDay;

    const newLabels = [];
    for (let i = 0; i < nbChunks; i++) {
      const timestamp = startTimestamp + i * chunkTime;
      const datetime = new Date(timestamp * 1000);
      newLabels.push(datetime);
    }

    return {
      newLabels,
      chunkTime,
    };
  }

  useEffect(() => {
    if (isDataLoading || !currentAccount || isDataError) return;

    const { newLabels, chunkTime } = computeLabels();

    let growthValues = new Array(newLabels.length).fill(0);
    let revenueValues = new Array(newLabels.length).fill(0);

    const reversedData = JSON.parse(JSON.stringify(growthData));
    for (const key of Object.keys(reversedData)) {
      reversedData[key].reverse();
    }
    const reversedLabels = [...newLabels].reverse();

    const emptyGrowthData: {
      [lToken: string]: [number, number];
    } = {};
    Object.keys(reversedData).forEach((lToken) => {
      emptyGrowthData[lToken] = [0, 0];
    });

    const perLabelGrowthData = new Array(newLabels.length)
      .fill(null)
      .map(() => JSON.parse(JSON.stringify(emptyGrowthData)));

    for (const lToken of Object.keys(reversedData)) {
      let index = 0;
      let currentLabel = reversedLabels[index];
      let nextLabel = reversedLabels[index + 1];
      let cumulatedBalanceBefore = 0;
      let cumulatedGrowth = 0;
      let count = 0;

      for (let i = 0; i < reversedData[lToken].length; i++) {
        const dataPoint = reversedData[lToken][i];
        const nextDataPoint = reversedData[lToken][i + 1];

        if (!nextDataPoint) {
          revenueValues[index] += dataPoint.revenue;
          cumulatedGrowth += dataPoint.growth;
          cumulatedBalanceBefore += dataPoint.balanceBefore;
          count++;

          if (count === 0) perLabelGrowthData[index][lToken] = [0, 0];
          else
            perLabelGrowthData[index][lToken] = [
              cumulatedBalanceBefore / count,
              cumulatedGrowth,
            ];
          break;
        } else if (nextDataPoint.timestamp > currentLabel.getTime() / 1000) {
          revenueValues[index] += dataPoint.revenue;
          cumulatedGrowth += dataPoint.growth;
          cumulatedBalanceBefore += dataPoint.balanceBefore;
          count++;
        } else if (!nextLabel) {
          const timeUntilEndOfLabel =
            dataPoint.timestamp - currentLabel.getTime() / 1000;
          const timeUntilNextDataPoint =
            dataPoint.timestamp - nextDataPoint.timestamp;
          const proportion = timeUntilEndOfLabel / timeUntilNextDataPoint;

          revenueValues[index] += dataPoint.revenue;
          cumulatedGrowth += dataPoint.growth * proportion;
          cumulatedBalanceBefore += dataPoint.balanceBefore;
          count++;

          if (count === 0) perLabelGrowthData[index][lToken] = [0, 0];
          else
            perLabelGrowthData[index][lToken] = [
              cumulatedBalanceBefore / count,
              cumulatedGrowth,
            ];
          break;
        } else {
          const timeUntilNextDataPoint =
            dataPoint.timestamp - nextDataPoint.timestamp;

          const proportion1 =
            (dataPoint.timestamp - currentLabel.getTime() / 1000) /
            timeUntilNextDataPoint;
          revenueValues[index] += dataPoint.revenue * proportion1;
          cumulatedGrowth += dataPoint.growth * proportion1;
          cumulatedBalanceBefore += dataPoint.balanceBefore;
          count++;

          if (count === 0) perLabelGrowthData[index][lToken] = [0, 0];
          else
            perLabelGrowthData[index][lToken] = [
              cumulatedBalanceBefore / count,
              cumulatedGrowth,
            ];

          index++;
          currentLabel = reversedLabels[index];
          nextLabel = reversedLabels[index + 1];
          cumulatedBalanceBefore = 0;
          cumulatedGrowth = 0;
          count = 0;

          const entireChunkProportion = chunkTime / timeUntilNextDataPoint;

          while (
            currentLabel &&
            currentLabel.getTime() / 1000 > nextDataPoint.timestamp
          ) {
            revenueValues[index] += dataPoint.revenue * entireChunkProportion;
            cumulatedGrowth += dataPoint.growth * entireChunkProportion;
            cumulatedBalanceBefore += dataPoint.balanceBefore;
            count++;

            if (count === 0) perLabelGrowthData[index][lToken] = [0, 0];
            else
              perLabelGrowthData[index][lToken] = [
                cumulatedBalanceBefore / count,
                cumulatedGrowth,
              ];

            if (!nextLabel) break;

            index++;
            currentLabel = reversedLabels[index];
            nextLabel = reversedLabels[index + 1];
            cumulatedBalanceBefore = 0;
            cumulatedGrowth = 0;
            count = 0;
          }

          if (currentLabel) {
            const proportion2 =
              (chunkTime -
                (nextDataPoint.timestamp - currentLabel.getTime() / 1000)) /
              timeUntilNextDataPoint;
            revenueValues[index] += dataPoint.revenue * proportion2;
            cumulatedGrowth += dataPoint.growth * proportion2;
            cumulatedBalanceBefore += dataPoint.balanceBefore;
            count++;
          }
        }
      }

      if (count > 0) {
        if (count === 0) perLabelGrowthData[index][lToken] = [0, 0];
        else
          perLabelGrowthData[index][lToken] = [
            cumulatedBalanceBefore / count,
            cumulatedGrowth,
          ];
      }
    }

    for (let i = 0; i < newLabels.length; i++) {
      const combinedData = [];

      for (const lToken of Object.keys(perLabelGrowthData[i])) {
        combinedData.push([
          perLabelGrowthData[i][lToken][0],
          perLabelGrowthData[i][lToken][1],
        ]);
      }

      const totalWeight = combinedData.reduce((acc, val) => acc + val[0], 0);
      const weightedSum = combinedData.reduce(
        (acc, val) => acc + val[0] * val[1],
        0,
      );
      const weightedAvg = totalWeight !== 0 ? weightedSum / totalWeight : 0;

      growthValues[i] = weightedAvg;
    }

    setLabels(newLabels);
    setFormattedGrowthData(growthValues.reverse());
    setRevenueData(revenueValues.reverse());
  }, [growthData, period]);

  return (
    <article
      className={twMerge(
        "flex flex-col items-center justify-center p-8 pr-5",
        className,
      )}
    >
      <div className="flex h-full w-full items-end justify-center rounded-3xl bg-primary/10">
        <div className="h-full w-full p-4 ">
          {isDataLoading && (
            <div className="bg/primary-10 flex h-full w-full animate-fadeIn items-center justify-center">
              <Spinner />
            </div>
          )}

          {!isDataLoading && isDataError && (
            <div className="bg/primary-10 flex h-full w-full animate-fadeIn items-center justify-center text-center text-lg font-semibold text-primary/80">
              {dataErrorMessage}.
            </div>
          )}

          {!isDataLoading && !isDataError && (
            <div className="h-full w-full pt-3">
              <Bar
                options={{
                  layout: {
                    padding: {
                      left: 0,
                    },
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: "rgb(30 41 59)",
                      footerSpacing: 5,
                      titleSpacing: 10,
                      titleFont: {
                        family: "var(--font-body)",
                        weight: "bold",
                        size: 18,
                      },
                      footerFont: {
                        family: "var(--font-body)",
                        size: 13,
                      },
                      footerColor: "rgb(255 255 255 / 0.6)",
                      padding: 15,
                      cornerRadius: 10,
                      callbacks: {
                        title: function (tooltipItems) {
                          if (isGrowthGraph) {
                            return `Growth:  ${formatRate(
                              tooltipItems[0].parsed.y * 100,
                              false,
                            )}%`;
                          } else {
                            return `Revenue:  $${formatAmount(tooltipItems[0].parsed.y)}`;
                          }
                        },
                        label: function (tooltipItem) {
                          return "";
                        },
                        footer(tooltipItems) {
                          const dataIndex = tooltipItems[0].dataIndex;

                          let from = labels![dataIndex].toLocaleDateString();
                          let to = "now";
                          if (labels![dataIndex + 1])
                            to = labels![dataIndex + 1].toLocaleDateString();

                          // Return the appropriate label here
                          return `From:  ${from}\nTo:       ${to}`;
                        },
                      },
                    },
                  },
                  // Taken from: https://www.chartjs.org/docs/latest/samples/animations/delay.html
                  animation: {
                    onComplete: () => {
                      delayed = true;
                    },
                    delay: (context) => {
                      let delay = 0;
                      if (
                        context.type === "data" &&
                        context.mode === "default" &&
                        !delayed
                      ) {
                        delay = context.dataIndex * 25;
                      }
                      return delay;
                    },
                  },
                  elements: {
                    bar: {
                      borderRadius: 10,
                      backgroundColor: "rgb(99 102 241 / 0.7)",
                      hoverBackgroundColor: "rgb(99 102 241)",
                      borderWidth: 0,
                    },
                  },
                  scales: {
                    y: {
                      display: false,
                    },
                    x: {
                      type: "time",
                      ticks: {
                        source: "labels",
                        font: {
                          family: "var(--font-body)",
                          weight: "bold",
                        },
                      },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                data={{
                  labels: labels,
                  datasets: [
                    {
                      label: "Revenue",
                      data: revenueData,
                      hidden: isGrowthGraph,
                    },
                    {
                      label: "Growth",
                      data: formattedGrowthData,
                      hidden: !isGrowthGraph,
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="items center mt-10 flex flex-col justify-center gap-5">
        <div className="flex items-center justify-center gap-3 text-base font-semibold">
          <p>Revenue ($)</p>
          <SwitchButton
            checked={isGrowthGraph}
            setChecked={setIsGrowthGraph}
            disabled={isDataLoading || isChangingNetwork}
          />
          <p>Growth (%)</p>
        </div>
        <RadioButtonGroup
          options={periodOptions}
          value={period}
          setValue={setPeriod}
          disabled={isDataLoading || isChangingNetwork}
          className="flex items-center justify-center gap-3"
          itemClassName="flex aspect-square h-12 w-12 items-center justify-center"
        />
      </div>
    </article>
  );
}
