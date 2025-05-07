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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium">키오스크 등록</h1>
          <p className="text-gray-500 mt-1">
            키오스크를 등록하여 주문을 관리하세요
          </p>
        </div>
        {registrationToken ? (
          <Button
            onClick={generateRegistrationToken}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                재생성 중
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" />
                QR코드 재생성
              </>
            )}
          </Button>
        ) : null}
      </div>

      {registrationToken ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg bg-white p-6 flex flex-col items-center">
            <div className="mb-6 p-6 bg-white border rounded-lg">
              <QRCodeSVG value={registrationToken} size={240} />
            </div>

            <div className="flex items-center mb-4 text-lg">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              만료까지{" "}
              <span className="font-medium text-blue-600 ml-1">
                {formatTimeLeft()}
              </span>
            </div>
          </div>

          <div className="border rounded-lg bg-white p-6">
            <h2 className="text-lg font-medium mb-4">키오스크 등록 가이드</h2>

            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-medium">
                  1
                </span>
                <span>키오스크 앱을 실행하세요.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-medium">
                  2
                </span>
                <span>화면에 표시된 QR코드를 스캔하세요.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-medium">
                  3
                </span>
                <span>등록이 완료되면 키오스크를 사용할 수 있습니다.</span>
              </li>
            </ol>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded p-4 text-sm text-blue-700">
              <p>QR코드는 3분간 유효합니다. 만료 후에는 재생성이 필요합니다.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg bg-white p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <QrCode size={32} className="text-blue-500" />
          </div>

          <h2 className="text-xl font-medium mb-3">
            키오스크를 등록하려면 QR코드가 필요합니다
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            아래 버튼을 클릭하여 키오스크 등록용 QR코드를 생성하세요. 생성된
            QR코드는 3분 동안 유효합니다.
          </p>

          <Button
            onClick={generateRegistrationToken}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                QR코드 생성 중...
              </>
            ) : (
              <>
                <QrCode size={18} className="mr-2" />
                QR코드 생성하기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
