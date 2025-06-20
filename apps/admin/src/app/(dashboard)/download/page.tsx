"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

type DownloadStatus = "downloading" | "completed" | "failed";

export default function ExportPage() {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("downloading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const downloadExcel = async () => {
      try {
        setDownloadStatus("downloading");

        const response = await api.get("/export", {
          responseType: "blob",
          headers: {
            Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const formattedDate = `${year}${month}${day}-${hours}${minutes}${seconds}`;
        const filename = `Flick-${formattedDate}.xlsx`;

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setDownloadStatus("completed");
        toast.success("엑셀 파일 다운로드 완료");

        setTimeout(() => {
          window.close();
        }, 1500);
      } catch (error) {
        setDownloadStatus("failed");
        const errorMsg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        setErrorMessage(errorMsg);
        toast.error(`엑셀 파일 다운로드 실패: ${errorMsg}`);
        console.error("Export error:", error);
      }
    };

    downloadExcel();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-900">엑셀 다운로드</h1>
          <p className="mt-1 text-sm text-gray-500">데이터를 엑셀 파일로 내보냅니다</p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          {downloadStatus === "downloading" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#4990FF]/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#4990FF] animate-spin" />
              </div>
              <h2 className="text-base font-medium text-gray-900">
                엑셀 파일 다운로드 중
              </h2>
              <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
            </div>
          )}

          {downloadStatus === "completed" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-base font-medium text-gray-900">다운로드 완료</h2>
            </div>
          )}

          {downloadStatus === "failed" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-base font-medium text-gray-900">다운로드 실패</h2>
              <p className="text-sm text-gray-500">{errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="h-9 px-4 bg-[#4990FF] text-white text-sm font-medium rounded-lg hover:bg-[#4990FF]/90 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}