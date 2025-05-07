"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { ProductModal } from "@/components/product/ProductModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import Image from "next/image";

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

interface SortableProductCardProps {
  product: ProductResponse;
  onEdit: (product: ProductResponse) => void;
  onDelete: (id: number) => void;
}

function SortableProductCard({
  product,
  onEdit,
  onDelete,
}: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusBadge = (status: "AVAILABLE" | "SOLD_OUT" | "HIDDEN") => {
    switch (status) {
      case "AVAILABLE":
        return {
          text: "판매중",
          color: "bg-green-50 text-green-600 border-green-200",
        };
      case "SOLD_OUT":
        return { text: "품절", color: "bg-red-50 text-red-600 border-red-200" };
      case "HIDDEN":
        return {
          text: "숨김",
          color: "bg-gray-50 text-gray-500 border-gray-200",
        };
    }
  };

  const badge = getStatusBadge(product.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-white ${isDragging ? "ring-2 ring-blue-400" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="aspect-square bg-gray-50 relative cursor-move">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-gray-400">이미지 없음</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center mb-2">
          <h3 className="font-medium text-base truncate">{product.name}</h3>
          <div
            className={`text-xs ml-2 px-2 py-1 rounded border ${badge.color}`}
          >
            {badge.text}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="font-medium">
            {product.price.toLocaleString()}원
          </span>
          <span className="text-sm text-gray-500">재고: {product.stock}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Edit size={16} className="mr-1" />
            수정
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash size={16} className="mr-1" />
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<ProductResponse | null>(
    null
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const { data: products = [], isLoading } = useQuery<ProductResponse[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse[]>("/products");
      return data.sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      toast.success("상품이 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("상품 삭제에 실패했습니다"),
  });

  const updateSortOrderMutation = useMutation({
    mutationFn: async (products: ProductResponse[]) => {
      const updatePromises = products.map((product, index) => {
        return api.patch<void>(`/products/${product.id}`, { sortOrder: index });
      });
      await Promise.all(updatePromises);
    },
    onSuccess: () => {
      toast.success("상품 순서가 저장되었습니다");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("상품 순서 변경에 실패했습니다"),
  });

  const handleAddProduct = (): void => {
    setCurrentProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product: ProductResponse): void => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = (): void => {
    setModalOpen(false);
    setCurrentProduct(null);
  };

  const handleProductSave = (): void => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setModalOpen(false);
    setCurrentProduct(null);
  };

  const deleteProduct = (id: number): void => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id.toString() === active.id);
      const newIndex = products.findIndex((p) => p.id.toString() === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      queryClient.setQueryData(["products"], newProducts);
      updateSortOrderMutation.mutate(newProducts);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium">상품 관리</h1>
          <p className="text-gray-500 mt-1">총 {products.length}개의 상품</p>
        </div>
        <Button
          onClick={handleAddProduct}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus size={18} className="mr-2" />
          상품 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-gray-50">
              <p className="text-gray-500 mb-4">등록된 상품이 없습니다</p>
              <Button
                onClick={handleAddProduct}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus size={16} className="mr-1" />
                상품 추가
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={products.map((p) => p.id.toString())}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <SortableProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={deleteProduct}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      {modalOpen && (
        <div
          className={
            isMobile
              ? "fixed inset-0 bg-white z-50"
              : "fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          }
        >
          <div
            className={
              isMobile
                ? "h-full flex flex-col"
                : "bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden"
            }
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-medium">
                {currentProduct ? "상품 수정" : "상품 추가"}
              </h2>
              <button type="button" onClick={handleModalClose} className="p-1">
                <X size={20} />
              </button>
            </div>
            <div
              className={
                isMobile
                  ? "flex-1 overflow-auto"
                  : "max-h-[calc(90vh-60px)] overflow-auto"
              }
            >
              <ProductModal
                product={currentProduct}
                onClose={handleModalClose}
                onSave={handleProductSave}
                fullScreen={isMobile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
