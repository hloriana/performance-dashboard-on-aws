import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useColors } from "../hooks";
import "./PartWholeChartPreview.css";

type Props = {
  title: string;
  summary: string;
  parts: Array<string>;
  data?: Array<object>;
  summaryBelow: boolean;
};

const PartWholeChartPreview = (props: Props) => {
  const [partsHover, setPartsHover] = useState(null);
  const [hiddenParts, setHiddenParts] = useState<Array<string>>([]);

  const partWholeData = useRef<Array<object>>([]);
  const partWholeParts = useRef<Array<string>>([]);
  let total = useRef<number>(0);

  const { data, parts } = props;
  useMemo(() => {
    if (data) {
      let bar = {};
      total.current = 0;
      partWholeParts.current = [];
      partWholeData.current = [];
      for (let i = 0; i < data.length; i++) {
        const key = data[i][parts[0] as keyof object];
        const value = data[i][parts[1] as keyof object];
        const barKey = `${key} ${value}`;
        bar = {
          ...bar,
          [barKey]: value,
        };
        partWholeParts.current.push(barKey);
        if (hiddenParts.includes(barKey)) {
          continue;
        }
        total.current += isNaN(value) ? 0 : value;
      }
      partWholeData.current.push(bar);
    }
  }, [data, parts, partWholeData, partWholeParts, hiddenParts]);

  const colors = useColors(partWholeParts.current.length);

  const getOpacity = useCallback(
    (dataKey) => {
      if (!partsHover) {
        return 1;
      }
      return partsHover === dataKey ? 1 : 0.2;
    },
    [partsHover]
  );

  const toggleParts = (e: any) => {
    if (hiddenParts.includes(e.dataKey)) {
      const hidden = hiddenParts.filter((column) => column !== e.dataKey);
      setHiddenParts(hidden);
    } else {
      setHiddenParts([...hiddenParts, e.dataKey]);
    }
  };

  const renderLegendText = (value: string) => {
    const index = value.lastIndexOf(" ");
    const label = value.substring(0, index);
    const amount = value.substring(index + 1);
    return (
      <span>
        <span className="margin-left-05 font-sans-md text-bottom">{label}</span>
        <div className="margin-left-4 margin-bottom-2 text-bold">{amount}</div>
      </span>
    );
  };

  return (
    <div>
      <h2 className="margin-left-1 margin-bottom-1">{props.title}</h2>
      {!props.summaryBelow && (
        <p className="margin-left-1 margin-top-0 margin-bottom-2">
          {props.summary}
        </p>
      )}
      {partWholeData.current.length && (
        <ResponsiveContainer
          width="100%"
          height={data && data.length > 15 ? 600 : 300}
        >
          <BarChart
            data={partWholeData.current}
            layout="vertical"
            margin={{ right: -50, left: -50 }}
            maxBarSize={100}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis
              tickLine={false}
              domain={[0, "dataMax"]}
              ticks={[0, total.current]}
              axisLine={false}
              interval="preserveStartEnd"
              type="number"
              padding={{ left: 2, right: 2 }}
            />
            <YAxis
              orientation="left"
              yAxisId="left"
              tick={false}
              tickLine={false}
              type="category"
              padding={{ top: 10, bottom: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={false}
              tickLine={false}
              type="category"
              padding={{ top: 10, bottom: 10 }}
            />
            <Legend
              verticalAlign="top"
              formatter={renderLegendText}
              iconSize={24}
              wrapperStyle={{
                top: 0,
                right: 0,
                width: "100%",
              }}
              onClick={toggleParts}
              onMouseLeave={(e) => setPartsHover(null)}
              onMouseEnter={(e) => setPartsHover(e.dataKey)}
            />
            {partWholeParts.current.map((part, index) => {
              return (
                <Bar
                  yAxisId="left"
                  stackId={"a"}
                  dataKey={part}
                  key={index}
                  fill={colors[index]}
                  fillOpacity={getOpacity(part)}
                  stroke="white"
                  strokeWidth={2}
                  hide={hiddenParts.includes(part)}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
      {props.summaryBelow && (
        <p className="margin-left-1 margin-top-3 margin-bottom-0">
          {props.summary}
        </p>
      )}
    </div>
  );
};

export default PartWholeChartPreview;
