import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  data: any;
  type: 'table' | 'chart';
  onExport: (format: 'csv' | 'json' | 'excel') => void;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  type,
  onExport,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (type === 'chart' && data) {
      // Transform data into chart format
      // This is a simplified example - you would need to adapt this to your actual data structure
      const transformedData: ChartData = {
        labels: data.labels || [],
        datasets: [
          {
            label: data.title || 'Data Series',
            data: data.values || [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
        ],
      };
      setChartData(transformedData);
    }
  }, [data, type]);

  const renderTable = () => {
    if (!data || !data.headers || !data.rows) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {data.headers.map((header: string, index: number) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: any, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderChart = () => {
    if (!chartData) return null;

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: data.title || 'Chart',
        },
      },
    };

    return (
      <div className="w-full h-96">
        {chartType === 'line' ? (
          <Line options={options} data={chartData} />
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          {type === 'chart' && (
            <>
              <button
                onClick={() => setChartType('line')}
                className={`px-4 py-2 rounded ${
                  chartType === 'line'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Line Chart
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded ${
                  chartType === 'bar'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Bar Chart
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onExport('csv')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Export CSV
          </button>
          <button
            onClick={() => onExport('json')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export JSON
          </button>
          <button
            onClick={() => onExport('excel')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="mt-4">
        {type === 'table' ? renderTable() : renderChart()}
      </div>
    </div>
  );
}; 