"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Clock, QrCode } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

interface RegistrationTokenResponse {
  registrationToken: string;
}

export default function KioskRegistrationPage() {
  const [registrationToken, setRegistrationToken] = useState<string | null>(
    null
  );
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (expiresAt) {
      interval = setInterval(() => {
        const now = new Date();
        const secondsLeft = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        );
        setTimeLeft(secondsLeft);

        if (secondsLeft === 0) {
          setRegistrationToken(null);
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expiresAt]);

  const generateRegistrationToken = async (): Promise<void> => {
    setIsGenerating(true);

    try {
      const response =
        await api.post<RegistrationTokenResponse>("/kiosks/generate");
      setRegistrationToken(response.data.registrationToken);

      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 3);
      setExpiresAt(expiry);
      setTimeLeft(180);
    } catch {
      toast.error("등록 토큰 생성에 실패했습니다");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimeLeft = (): string => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-gray-900">키오스크 등록</h1>
            <div className="flex items-center h-7 px-2 bg-[#4990FF]/10 rounded">
              <span className="text-xs font-medium text-[#4990FF]">
                {registrationToken ? '활성화됨' : '대기중'}
              </span>
            </div>
          </div>
          {registrationToken && (
            <Button
              onClick={generateRegistrationToken}
              disabled={isGenerating}
              className="h-9 px-4 bg-[#4990FF] hover:bg-[#4990FF]/90 text-white text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  재생성 중
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  QR코드 재생성
                </>
              )}
            </Button>
          )}
        </div>

        {registrationToken ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg bg-white p-6 flex flex-col items-center">
              <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg">
                <QRCodeSVG value={registrationToken} size={240} />
              </div>

              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                만료까지{" "}
                <span className="font-medium text-[#4990FF] ml-1">
                  {formatTimeLeft()}
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h2 className="text-base font-medium text-gray-900 mb-4">
                키오스크 등록 가이드
              </h2>

              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#4990FF]/10 text-[#4990FF] mr-3 text-xs font-medium">
                    1
                  </span>
                  <span className="text-sm text-gray-600">키오스크 앱을 실행하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#4990FF]/10 text-[#4990FF] mr-3 text-xs font-medium">
                    2
                  </span>
                  <span className="text-sm text-gray-600">화면에 표시된 QR코드를 스캔하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#4990FF]/10 text-[#4990FF] mr-3 text-xs font-medium">
                    3
                  </span>
                  <span className="text-sm text-gray-600">등록이 완료되면 키오스크를 사용할 수 있습니다.</span>
                </li>
              </ol>

              <div className="mt-6 bg-[#4990FF]/10 rounded-lg p-4">
                <p className="text-sm text-[#4990FF]">
                  QR코드는 3분간 유효합니다. 만료 후에는 재생성이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg bg-white p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#4990FF]/10 rounded-full flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8 text-[#4990FF]" />
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-3">
              키오스크를 등록하려면 QR코드가 필요합니다
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
              아래 버튼을 클릭하여 키오스크 등록용 QR코드를 생성하세요. 
              생성된 QR코드는 3분 동안 유효합니다.
            </p>

            <Button
              onClick={generateRegistrationToken}
              disabled={isGenerating}
              className="h-9 px-4 bg-[#4990FF] hover:bg-[#4990FF]/90 text-white text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  QR코드 생성 중...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-1.5" />
                  QR코드 생성하기
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
