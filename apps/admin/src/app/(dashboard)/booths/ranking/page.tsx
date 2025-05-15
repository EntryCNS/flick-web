"use client";
import { Bar, Line } from "react-chartjs-2";
import api from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
  Scale,
  LineElement,
  PointElement,
  TimeScale,
} from "chart.js";
import { useEffect, useState, useRef, useCallback } from "react";
import { API_URL } from "@/constants/api";
import 'chartjs-adapter-date-fns';

interface BoothData {
  rank: number;
  id: number;
  name: string;
  totalSales: number;
}

interface WebSocketMessage {
  id: number;
  totalSales: number;
  timeStamp: string;
}

type ChartType = 'bar' | 'line';

const WEBSOCKET_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL = 30000;
const ANIMATION_DURATION = 500;
const ANIMATION_EASING = 'easeInOutQuart';

const generateColorForBooth = (boothId: number) => {
  const hue = (boothId * 137.508) % 360;
  return {
    borderColor: `hsl(${hue}, 70%, 50%)`,
    backgroundColor: `hsl(${hue}, 70%, 50%, 0.5)`,
  };
};

export default function BoothRankingPage() {
  const [boothRankingData, setBoothRankingData] = useState<BoothData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<Map<number, { time: string; sales: number }[]>>(new Map());
  const [chartType, setChartType] = useState<ChartType>('bar');
  const wsRef = useRef<WebSocket | null>(null);
  const chartRef = useRef<ChartJS<"bar" | "line"> | null>(null);
  const reconnectAttempts = useRef(0);
  const pingIntervalId = useRef<NodeJS.Timeout | null>(null);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
    Legend
  );

  const loadInitialData = async () => {
    try {
      const { data } = await api.get<BoothData[]>("/booths/rankings");
      setBoothRankingData(data.sort((a, b) => b.totalSales - a.totalSales));
    } catch (error) {
      console.error("[Booth Ranking] Failed to load initial data:", error);
    }
  };

  const updateBoothData = useCallback((updatedData: WebSocketMessage | WebSocketMessage[]) => {
    if (Array.isArray(updatedData)) {
      setBoothRankingData(prev => {
        const updated = prev.map(booth => {
          const latestUpdate = updatedData.find(update => update.id === booth.id);
          return latestUpdate 
            ? { ...booth, totalSales: latestUpdate.totalSales }
            : booth;
        }).sort((a, b) => b.totalSales - a.totalSales);
        return updated;
      });

      updatedData.forEach(message => {
        setTimeSeriesData(prev => {
          const newMap = new Map(prev);
          const boothData = newMap.get(message.id) || [];
          boothData.push({ time: message.timeStamp, sales: message.totalSales });
          newMap.set(message.id, boothData);
          return newMap;
        });
      });
    } else {
      setBoothRankingData(prev => {
        const updated = prev.map(booth => 
          booth.id === updatedData.id 
            ? { ...booth, totalSales: updatedData.totalSales }
            : booth
        ).sort((a, b) => b.totalSales - a.totalSales);
        return updated;
      });

      setTimeSeriesData(prev => {
        const newMap = new Map(prev);
        const boothData = newMap.get(updatedData.id) || [];
        boothData.push({ time: updatedData.timeStamp, sales: updatedData.totalSales });
        newMap.set(updatedData.id, boothData);
        return newMap;
      });
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(`${API_URL.replace('http', 'ws')}/ws/booth-ranking`);

      wsRef.current.onopen = () => {
        reconnectAttempts.current = 0;
        pingIntervalId.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL);
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "pong") return;
          updateBoothData(message);
        } catch (error) {
          console.error("[Booth Ranking] Failed to process WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        cleanupWebSocket();
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          setTimeout(setupWebSocket, WEBSOCKET_RECONNECT_DELAY);
        }
      };
    } catch (error) {
      console.error("[Booth Ranking] Failed to setup WebSocket:", error);
    }
  }, [updateBoothData]);

  const cleanupWebSocket = useCallback(() => {
    if (pingIntervalId.current) {
      clearInterval(pingIntervalId.current);
      pingIntervalId.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    setupWebSocket();
    return () => {
      cleanupWebSocket();
    };
  }, [setupWebSocket, cleanupWebSocket]);

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    animation: {
      duration: ANIMATION_DURATION,
      easing: ANIMATION_EASING,
    },
    interaction: {
      mode: 'nearest',
      axis: 'y',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 12,
        displayColors: false,
        callbacks: {
          label(tooltipItem: TooltipItem<'bar'>) {
            return `판매금액: ${new Intl.NumberFormat("ko-KR").format(Number(tooltipItem.raw))}원`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        grid: { display: true },
        title: { 
          display: true, 
          text: "판매금액 (원)",
          font: { size: 14, weight: 'bold' }
        },
        ticks: {
          callback(tickValue: number | string) {
            return new Intl.NumberFormat("ko-KR").format(Number(tickValue)) + "원";
          },
        },
      },
      y: {
        type: 'category',
        grid: { display: false },
        title: { 
          display: true, 
          text: "부스",
          font: { size: 14, weight: 'bold' }
        },
      },
    },
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: ANIMATION_DURATION,
      easing: ANIMATION_EASING,
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 12,
        callbacks: {
          label(tooltipItem: TooltipItem<'line'>) {
            return `판매금액: ${new Intl.NumberFormat("ko-KR").format(Number(tooltipItem.raw))}원`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        title: { 
          display: true, 
          text: "시간",
          font: { size: 14, weight: 'bold' }
        },
      },
      y: {
        type: 'linear',
        grid: { display: true },
        title: { 
          display: true, 
          text: "판매금액 (원)",
          font: { size: 14, weight: 'bold' }
        },
        ticks: {
          callback(tickValue: number | string) {
            return new Intl.NumberFormat("ko-KR").format(Number(tickValue)) + "원";
          },
        },
      },
    },
  };

  const barData = {
    labels: boothRankingData.map(booth => booth.name),
    datasets: [{
      data: boothRankingData.map(booth => booth.totalSales),
      backgroundColor: boothRankingData.map(booth => 
        generateColorForBooth(booth.id).backgroundColor
      ),
      borderColor: boothRankingData.map(booth => 
        generateColorForBooth(booth.id).borderColor
      ),
      borderWidth: 1,
      borderRadius: 4,
      barThickness: 24,
      minBarLength: 10,
    }],
  };

  const lineData = {
    datasets: boothRankingData.map(booth => ({
      label: booth.name,
      data: (timeSeriesData.get(booth.id) || []).map(point => ({
        x: new Date(point.time),
        y: point.sales
      })),
      borderColor: generateColorForBooth(booth.id).borderColor,
      backgroundColor: generateColorForBooth(booth.id).backgroundColor,
      tension: 0.4,
      pointRadius: 3,
    })),
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">부스 랭킹</h1>
          <p className="text-gray-500 mt-1">
            현재 운영중인 부스의 매출 현황을 실시간으로 확인할 수 있습니다
          </p>
          <div className="mt-4 space-x-4">
            {/* <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded ${
                chartType === 'bar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              막대 그래프
            </button> */}
            {/* <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded ${
                chartType === 'line' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              시계열 그래프
            </button> */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="overflow-x-auto">
          {boothRankingData.length > 0 ? (
            <div style={{ height: '500px' }}>
              {chartType === 'bar' ? (
                <Bar
                  ref={chartRef as any}
                  options={barOptions} 
                  data={barData}
                />
              ) : (
                <Line
                  ref={chartRef as any}
                  options={lineOptions}
                  data={lineData}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              표시할 데이터가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}