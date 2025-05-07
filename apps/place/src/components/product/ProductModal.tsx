"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, Upload, Loader2 } from "lucide-react";
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
  const formRef = useRef<HTMLFormElement>(null);

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
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageUrl(null);

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
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-64 bg-gray-50 relative">
          {imageUrl ? (
            <>
              <div
                style={{
                  backgroundImage: `url(${imageUrl})`,
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
              <p className="text-xs text-gray-400">
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
              imageUrl ? "pointer-events-none" : ""
            }`}
          />
        </div>
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
