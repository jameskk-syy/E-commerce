"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FiTrendingUp, FiCalendar } from "react-icons/fi";

ChartJS.register(BarElement, CategoryScale, Tooltip, LinearScale, Legend);

interface BarGraphProps {
  data: GraphData[];
}

export type GraphData = {
  day: string;
  date: string;
  totalAmount: number;
};

const BarGraph: React.FC<BarGraphProps> = ({ data = [] }) => {
  const labels = data.map((item) => item.day.slice(0, 3));
  const amounts = data.map((item) => item.totalAmount);

  const weeklyTotal = useMemo(() => {
    return amounts.reduce((acc, curr) => acc + curr, 0);
  }, [amounts]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Sales (KSh)",
        data: amounts,
        backgroundColor: "rgba(79, 70, 229, 0.85)",
        hoverBackgroundColor: "rgba(67, 56, 202, 1)",
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#09090b",
        titleColor: "#ffffff",
        bodyColor: "#a5b4fc",
        padding: 12,
        cornerRadius: 10,
        boxPadding: 4,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y || 0;
            return ` Revenue: KSh ${val.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#71717a",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(228, 228, 231, 0.6)",
          drawBorder: false,
        },
        ticks: {
          color: "#71717a",
          font: {
            size: 11,
          },
          callback: (value: any) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FiTrendingUp className="text-base" />
            </span>
            <h3 className="font-extrabold text-zinc-950 text-base sm:text-lg tracking-tight">
              7-Day Sales Trend
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Confirmed M-Pesa & Card revenue breakdown by day of the week.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">
              Weekly Volume
            </span>
            <span className="text-base sm:text-lg font-black text-zinc-950 font-sans">
              KSh {weeklyTotal.toLocaleString()}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 text-zinc-600 text-xs font-bold border border-zinc-200">
            <FiCalendar className="text-xs text-zinc-400" />
            <span>Past 7 Days</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-72 sm:h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarGraph;
