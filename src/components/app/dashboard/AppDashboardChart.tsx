import {
  Card,
  Switch,
  RadioGroup,
  RadioGroupItem,
  formatAmount,
  Spinner,
  formatRate,
  Amount,
} from "@/components/ui";
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
import { useGrowthRevenueData } from "./useGrowthRevenueData";
Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  TimeScale,
  TimeSeriesScale,
  LogarithmicScale,
);

const secondsPerDay = 60 * 60 * 24;

export const AppDashboardChart: React.PropsWithoutRef<typeof Card> = ({
  className,
}) => {
  const [period, setPeriod] = useState("90");
  const [type, setType] = useState<"revenue" | "growth">("revenue");
  const { growthData, isDataLoading, isDataError, dataErrorMessage } =
    useGrowthRevenueData();
  const [labels, setLabels] = useState<Date[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [formattedGrowthData, setFormattedGrowthData] = useState<number[]>([]);

  let delayed: boolean;

  const computeLabels = () => {
    let _labels: Date[] = [];

    let numberOfDays = 0;
    if (period !== "all") numberOfDays = Number(period);
    else {
      const investmentStarts: number[] = [];
      for (const lTokenData of Object.values(growthData)) {
        if (lTokenData.length > 0) {
          investmentStarts.push(lTokenData[0].timestamp);
        }
      }

      if (investmentStarts.length === 0) return { _labels, chunkTime: 0 };

      const oldestInvestmentStart = Math.min(...investmentStarts);
      numberOfDays =
        oldestInvestmentStart !== null
          ? (Date.now() / 1000 - oldestInvestmentStart) / secondsPerDay
          : 365;
    }

    const startTimestamp =
      Math.floor(Date.now() / 1000) - numberOfDays * secondsPerDay;

    let chunksNumber;
    if (numberOfDays === 7) chunksNumber = 7;
    else if (numberOfDays === 30) chunksNumber = 10;
    else if (numberOfDays === 90) chunksNumber = 12;
    else if (numberOfDays === 365) chunksNumber = 15;
    else chunksNumber = 30;

    const chunkSize = numberOfDays / chunksNumber;
    const chunkTime = chunkSize * secondsPerDay;

    for (let i = 0; i < chunksNumber; i++) {
      const timestamp = startTimestamp + i * chunkTime;
      const datetime = new Date(timestamp * 1000);
      if (numberOfDays < chunksNumber) _labels.push(datetime);
      else _labels.push(datetime);
    }

    return {
      _labels,
      chunkTime,
    };
  };

  const computeChartData = () => {
    // Return  if there is a data error
    if (isDataError) return;

    // Compute labels (x axis)
    const { _labels, chunkTime } = computeLabels();

    // Compute growth and revenue data (y axis)
    let _growthData: number[] = new Array(_labels.length).fill(0);
    let _revenueData: number[] = new Array(_labels.length).fill(0);

    // Reverse data and label array so the most recent data is first
    const reversedData = JSON.parse(JSON.stringify(growthData));
    for (const key of Object.keys(reversedData)) {
      reversedData[key].reverse();
    }
    const reversedLabels = [..._labels].reverse();

    const emptyGrowthData: Record<string, [number, number]> = {};
    Object.keys(reversedData).forEach(
      (lToken) => (emptyGrowthData[lToken] = [0, 0]),
    );
    const perLabelGrowthData: Record<string, [number, number]>[] = new Array(
      _labels.length,
    )
      .fill(null)
      .map(() => JSON.parse(JSON.stringify(emptyGrowthData)));

    for (const lToken of Object.keys(reversedData)) {
      let currentLabelIndex = 0;
      let currentLabel = reversedLabels[currentLabelIndex];
      let nextLabel = reversedLabels[currentLabelIndex + 1];
      let currentLabelGrowthData = {
        cumulatedBalanceBefore: 0,
        cumulatedGrowth: 0,
        count: 0,
      };

      function fillCurrentLabelGrowthData() {
        if (currentLabelGrowthData.count == 0)
          perLabelGrowthData[currentLabelIndex][lToken] = [0, 0];
        else
          perLabelGrowthData[currentLabelIndex][lToken] = [
            currentLabelGrowthData.cumulatedBalanceBefore /
              currentLabelGrowthData.count,
            currentLabelGrowthData.cumulatedGrowth,
          ];

        // Reset current label growth data
        currentLabelGrowthData = {
          cumulatedBalanceBefore: 0,
          cumulatedGrowth: 0,
          count: 0,
        };
      }

      function incrementLabel() {
        fillCurrentLabelGrowthData();
        currentLabelIndex++;
        currentLabel = reversedLabels[currentLabelIndex];
        nextLabel = reversedLabels[currentLabelIndex + 1];
      }

      // Note that we iterate from newest to oldest data (as the data array is reversed)
      for (let i = 0; i < reversedData[lToken].length; i++) {
        const dataPoint = reversedData[lToken][i];
        const nextDataPoint = reversedData[lToken][i + 1];

        // If there is no next data point
        if (!nextDataPoint) {
          _revenueData[currentLabelIndex] += dataPoint.revenue;
          currentLabelGrowthData.cumulatedGrowth += dataPoint.growth;
          currentLabelGrowthData.cumulatedBalanceBefore +=
            dataPoint.balanceBefore;
          currentLabelGrowthData.count++;
          break;
        }

        // Or if next data point starts at the same label
        else if (nextDataPoint.timestamp > currentLabel.getTime() / 1000) {
          _revenueData[currentLabelIndex] += dataPoint.revenue;
          currentLabelGrowthData.cumulatedGrowth += dataPoint.growth;
          currentLabelGrowthData.cumulatedBalanceBefore +=
            dataPoint.balanceBefore;
          currentLabelGrowthData.count++;
        }

        // Or if there is no next label
        else if (!nextLabel) {
          //
          const timeUntilEndOfLabel =
            dataPoint.timestamp - currentLabel.getTime() / 1000;
          // Retrieve the time span between current data point and the next one
          const timeUntilNextDataPoint =
            dataPoint.timestamp - nextDataPoint.timestamp;
          const proportion = timeUntilEndOfLabel / timeUntilNextDataPoint;
          _revenueData[currentLabelIndex] += dataPoint.revenue;
          currentLabelGrowthData.cumulatedGrowth +=
            dataPoint.growth * proportion;
          currentLabelGrowthData.cumulatedBalanceBefore +=
            dataPoint.balanceBefore;
          currentLabelGrowthData.count++;

          break;
        }

        // Else
        else {
          // Retrieve the time span between current data point and the next one
          const timeUntilNextDataPoint =
            dataPoint.timestamp - nextDataPoint.timestamp;

          // Handle "dataPoint to current label end" distance
          const proportion1 =
            (dataPoint.timestamp - currentLabel.getTime() / 1000) /
            timeUntilNextDataPoint;
          _revenueData[currentLabelIndex] += dataPoint.revenue * proportion1;
          currentLabelGrowthData.cumulatedGrowth +=
            dataPoint.growth * proportion1;
          currentLabelGrowthData.cumulatedBalanceBefore +=
            dataPoint.balanceBefore;
          currentLabelGrowthData.count++;

          incrementLabel();

          // Handle every entirely crossed label chunks
          const entireChunkProportion = chunkTime / timeUntilNextDataPoint;

          // Update next label index and new start label
          while (currentLabel.getTime() / 1000 > nextDataPoint.timestamp) {
            _revenueData[currentLabelIndex] +=
              dataPoint.revenue * entireChunkProportion;
            currentLabelGrowthData.cumulatedGrowth +=
              dataPoint.growth * entireChunkProportion;
            currentLabelGrowthData.cumulatedBalanceBefore +=
              dataPoint.balanceBefore;
            currentLabelGrowthData.count++;
            if (!nextLabel) break;
            incrementLabel();
          }

          // Handle "last label start to next data point" distance
          const proportion2 =
            (chunkTime -
              (nextDataPoint.timestamp - currentLabel.getTime() / 1000)) /
            timeUntilNextDataPoint;
          _revenueData[currentLabelIndex] += dataPoint.revenue * proportion2;
          currentLabelGrowthData.cumulatedGrowth +=
            dataPoint.growth * proportion2;
          currentLabelGrowthData.cumulatedBalanceBefore +=
            dataPoint.balanceBefore;
          currentLabelGrowthData.count++;
        }
      }
      fillCurrentLabelGrowthData();
    }

    for (let i = 0; i < _labels.length; i++) {
      const combinedData: [number, number][] = [];
      for (const lToken of Object.keys(perLabelGrowthData[i])) {
        combinedData.push([
          perLabelGrowthData[i][lToken][0],
          perLabelGrowthData[i][lToken][1],
        ]);
      }
      let total_weight = combinedData.reduce((acc, val) => acc + val[0], 0);
      let weighted_sum = combinedData.reduce(
        (acc, val) => acc + val[0] * val[1],
        0,
      );
      let weighted_avg = total_weight !== 0 ? weighted_sum / total_weight : 0;
      _growthData[i] += weighted_avg;
    }

    // Set new data and labels
    setLabels(_labels);
    setFormattedGrowthData(_growthData.reverse());
    setRevenueData(_revenueData.reverse());
  };

  useEffect(() => {
    if (!isDataLoading) computeChartData();
  }, [growthData, isDataLoading, period]);

  return (
    <article
      className={twMerge(
        "flex flex-col items-center justify-center p-8 pr-5",
        className,
      )}
    >
      <div className="flex h-full w-full items-end justify-center rounded-3xl bg-primary/10">
        <div className="h-full w-full p-4 ">
          {(() => {
            if (isDataLoading)
              return (
                <div className="bg/primary-10 flex h-full w-full animate-fadeIn items-center justify-center">
                  <Spinner />
                </div>
              );
            else if (isDataError)
              return (
                <div className="bg/primary-10 flex h-full w-full animate-fadeIn items-center justify-center text-center text-lg font-semibold text-primary/80">
                  {dataErrorMessage}.
                </div>
              );
            else
              return (
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
                              if (type === "revenue")
                                return `Revenue:  $${formatAmount(tooltipItems[0].parsed.y)}`;
                              else
                                return `Growth:  ${formatRate(
                                  tooltipItems[0].parsed.y * 100,
                                  false,
                                )}%`;
                            },
                            label: function (tooltipItem) {
                              return "";
                            },
                            footer(tooltipItems) {
                              const dataIndex = tooltipItems[0].dataIndex;

                              let from =
                                labels![dataIndex].toLocaleDateString();
                              let to = "now";
                              if (labels![dataIndex + 1])
                                to =
                                  labels![dataIndex + 1].toLocaleDateString();

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
                          hidden: type !== "revenue",
                        },
                        {
                          label: "Growth",
                          data: formattedGrowthData,
                          hidden: type !== "growth",
                        },
                      ],
                    }}
                  />
                </div>
              );
          })()}
        </div>
      </div>
      <div className="items center mt-10 flex flex-col justify-center gap-5">
        <div className="flex items-center justify-center gap-3 text-base font-semibold">
          <p>Revenue ($)</p>
          <Switch
            disabled={isDataLoading || isDataError}
            onCheckedChange={(checked) =>
              setType(checked ? "growth" : "revenue")
            }
          />
          <p>Growth (%)</p>
        </div>
        <RadioGroup
          disabled={isDataLoading || isDataError}
          defaultValue="90"
          onValueChange={(value) => setPeriod(value)}
          className="flex items-center justify-center gap-3"
        >
          <RadioGroupItem
            value="7"
            id="7"
            className="flex aspect-square h-12 w-12 items-center justify-center"
          >
            <label htmlFor="7" className="pointer-events-none">
              7D
            </label>
          </RadioGroupItem>
          <RadioGroupItem
            value="30"
            id="30"
            className="flex aspect-square h-12 w-12 items-center justify-center"
          >
            <label htmlFor="30" className="pointer-events-none">
              1M
            </label>
          </RadioGroupItem>
          <RadioGroupItem
            value="90"
            id="90"
            className="flex aspect-square h-12 w-12 items-center justify-center"
          >
            <label htmlFor="90" className="pointer-events-none">
              3M
            </label>
          </RadioGroupItem>
          <RadioGroupItem
            value="365"
            id="365"
            className="flex aspect-square h-12 w-12 items-center justify-center"
          >
            <label htmlFor="365" className="pointer-events-none">
              1Y
            </label>
          </RadioGroupItem>
          <RadioGroupItem
            value="all"
            id="all"
            className="flex aspect-square h-12 w-12 items-center justify-center"
          >
            <label htmlFor="all" className="pointer-events-none">
              All
            </label>
          </RadioGroupItem>
        </RadioGroup>
      </div>
    </article>
  );
};
