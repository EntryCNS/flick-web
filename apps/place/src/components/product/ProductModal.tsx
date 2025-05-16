"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, Upload, Loader2, Camera } from "lucide-react";
import api from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProductResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  status: "AVAILABLE" | "SOLD_OUT" | "HIDDEN";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  status: "AVAILABLE" | "SOLD_OUT" | "HIDDEN";
  sortOrder: number;
}

interface UpdateProductRequest {
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  stock?: number;
  status?: "AVAILABLE" | "SOLD_OUT" | "HIDDEN";
  sortOrder?: number;
}

const productSchema = z.object({
  name: z.string().min(1, "상품 이름을 입력해주세요"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "가격은 0원 이상이어야 합니다"),
  stock: z.number().min(0, "재고는 0개 이상이어야 합니다"),
  status: z.enum(["AVAILABLE", "SOLD_OUT", "HIDDEN"]).default("AVAILABLE"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  product: ProductResponse | null;
  onClose: () => void;
  onSave: () => void;
  fullScreen?: boolean;
}

export function ProductModal({
  product,
  onClose,
  onSave,
  fullScreen = false,
}: ProductModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      status: "AVAILABLE" as const,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        status: product.status,
      });

      if (product.imageUrl) {
        setImageUrl(product.imageUrl);
        setPreviewImage(product.imageUrl);
      }
    }

    if (!fullScreen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [product, onClose, reset, fullScreen]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);

    try {
      // 이미 스트림이 있다면 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // 새 스트림 시작
      const constraints = {
        video: true,
        audio: false,
      };

      console.log("카메라 접근 시도 중...");
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      console.log("카메라 스트림 받음:", mediaStream);

      // 비디오 트랙 확인
      const videoTracks = mediaStream.getVideoTracks();
      console.log("비디오 트랙:", videoTracks);

      if (videoTracks.length === 0) {
        throw new Error("비디오 트랙이 없습니다");
      }

      // 스트림 설정
      setStream(mediaStream);
      setShowCamera(true);

      // 지연 후 비디오 요소에 스트림 설정 (DOM이 완전히 렌더링되도록)
      setTimeout(() => {
        if (videoRef.current) {
          console.log("비디오 요소에 스트림 설정");
          videoRef.current.srcObject = mediaStream;

          // 비디오가 로드되면 재생 시작
          videoRef.current.onloadedmetadata = () => {
            console.log("비디오 메타데이터 로드됨");
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  console.log("비디오 재생 시작됨");
                  setCameraReady(true);
                })
                .catch((error) => {
                  console.error("비디오 재생 실패:", error);
                  setCameraError("카메라 스트림을 표시할 수 없습니다.");
                });
            }
          };
        }
      }, 100);
    } catch (error) {
      console.error("카메라 접근 오류:", error);
      setCameraError(
        "카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요."
      );
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      setCameraError("카메라가 준비되지 않았습니다.");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // 비디오 요소의 현재 표시 크기로 캔버스 설정
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      console.log("비디오 크기:", videoWidth, "x", videoHeight);

      if (videoWidth === 0 || videoHeight === 0) {
        setCameraError("비디오 스트림이 활성화되지 않았습니다.");
        return;
      }

      // 캔버스 설정
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        setCameraError("캔버스 컨텍스트를 가져올 수 없습니다.");
        return;
      }

      // 비디오 프레임을 캔버스에 그리기
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 캔버스 내용을 데이터 URL로 변환
      const photoData = canvas.toDataURL("image/jpeg", 0.9);
      console.log("이미지 캡처됨");

      setImageUrl(photoData);
      setPreviewImage(photoData);
      stopCamera();
    } catch (error) {
      console.error("사진 캡처 오류:", error);
      setCameraError("이미지 캡처 중 오류가 발생했습니다.");
    }
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("이미지 크기는 5MB 이하여야 합니다");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result as string;
          setImageUrl(imageData);
          setPreviewImage(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageUrl(null);
    setPreviewImage(null);

    if (document.getElementById("image-upload") instanceof HTMLInputElement) {
      (document.getElementById("image-upload") as HTMLInputElement).value = "";
    }
  };

  const onSubmitForm = async (data: ProductFormData) => {
    if (!imageUrl && !product?.imageUrl) {
      toast.error("이미지를 업로드해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      if (product) {
        const updateData: UpdateProductRequest = {
          name: data.name,
          description: data.description || "",
          price: data.price,
          stock: data.stock,
          status: data.status,
        };

        if (imageUrl && imageUrl !== product.imageUrl) {
          updateData.imageUrl = imageUrl;
        }

        await api.patch<void>(`/products/${product.id}`, updateData);
        toast.success("상품이 수정되었습니다");
      } else {
        const { data: products } =
          await api.get<ProductResponse[]>("/products");
        const maxSortOrder =
          products.length > 0
            ? Math.max(...products.map((p) => p.sortOrder)) + 1
            : 0;

        const createData: CreateProductRequest = {
          name: data.name,
          description: data.description || "",
          price: data.price,
          imageUrl: imageUrl as string,
          stock: data.stock,
          sortOrder: maxSortOrder,
          status: data.status,
        };

        await api.post<void>("/products", createData);
        toast.success("상품이 추가되었습니다");
      }

      onSave();
    } catch {
      toast.error(
        product ? "상품 수정에 실패했습니다" : "상품 추가에 실패했습니다"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setValue("price", value ? parseInt(value) : 0);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setValue("stock", value ? parseInt(value) : 0);
  };

  const handleStatusChange = (value: string) => {
    setValue("status", value as "AVAILABLE" | "SOLD_OUT" | "HIDDEN");
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmitForm)}
      className={`space-y-6 ${fullScreen ? "p-4" : "p-4"}`}
    >
      <div>
        <Label
          htmlFor="image-upload"
          className="block text-sm font-medium mb-1"
        >
          상품 이미지<span className="text-red-500">*</span>
        </Label>

        {showCamera ? (
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-80 bg-black overflow-hidden">
            {cameraError ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-white">
                <div className="text-red-500 mb-2">{cameraError}</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCameraError(null);
                    stopCamera();
                  }}
                >
                  <X size={16} className="mr-1" />
                  닫기
                </Button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    backgroundColor: "black",
                  }}
                />

                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={stopCamera}
                  >
                    <X size={16} className="mr-1" />
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="bg-[#4990FF] hover:bg-[#3a7fd6]"
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                  >
                    {cameraReady ? "사진 촬영" : "카메라 준비 중..."}
                  </Button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-64 bg-gray-50 relative">
              {previewImage ? (
                <>
                  <div
                    style={{
                      backgroundImage: `url(${previewImage})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <Button
                    type="button"
                    onClick={clearImage}
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full shadow"
                  >
                    <X size={16} />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500 mb-2">
                    이미지를 드래그하거나 클릭하여 업로드하세요
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    최대 5MB, JPG, PNG, WebP 형식
                  </p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                  previewImage ? "pointer-events-none" : ""
                }`}
              />
            </div>

            {!previewImage && (
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="w-full md:w-auto flex items-center justify-center"
                >
                  <Camera size={16} className="mr-2" />
                  카메라로 촬영하기
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            상품 이름<span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="상품 이름을 입력하세요"
            className="w-full"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            가격 (원)<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="price"
              type="text"
              value={watch("price").toLocaleString()}
              onChange={handlePriceChange}
              placeholder="가격을 입력하세요"
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              원
            </span>
          </div>
          {errors.price && (
            <p className="text-red-500 text-xs">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock" className="text-sm font-medium">
            재고 수량<span className="text-red-500">*</span>
          </Label>
          <Input
            id="stock"
            type="text"
            value={watch("stock").toString()}
            onChange={handleStockChange}
            placeholder="재고 수량을 입력하세요"
          />
          {errors.stock && (
            <p className="text-red-500 text-xs">{errors.stock.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            상품 상태<span className="text-red-500">*</span>
          </Label>
          <Select value={watch("status")} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="상품 상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">판매중</SelectItem>
              <SelectItem value="SOLD_OUT">품절</SelectItem>
              <SelectItem value="HIDDEN">숨김</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-red-500 text-xs">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          상품 설명
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="상품에 대한 설명을 입력하세요"
          className="min-h-24 resize-none"
        />
        {errors.description && (
          <p className="text-red-500 text-xs">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#4990FF] hover:bg-[#3a7fd6]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>처리 중...</span>
            </div>
          ) : product ? (
            "상품 수정"
          ) : (
            "상품 추가"
          )}
        </Button>
      </div>
    </form>
  );
}
