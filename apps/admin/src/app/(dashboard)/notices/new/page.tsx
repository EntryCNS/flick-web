"use client";

import { useState } from "react";
import { CalendarDays, AlertCircle, Send, X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface craeteNoticeType {
  title: string;
  content: string;
  isPinned: boolean;
}

export default function AdminNoticeForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noticeType, setNoticeType] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");

  const handleAddAttachment = () => {
    // 실제 구현에서는 파일 업로드 로직이 들어갈 자리
    const newAttachment = { id: attachments.length + 1, name: `파일 ${attachments.length + 1}.pdf`, size: "1.2MB" };
    setAttachments([...attachments, newAttachment]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSubmit = () => {
    // 폼 제출 로직
    console.log({ title, content, noticeType, priority, startDate, endDate, attachments, tags });
    
    // 성공 메시지를 표시할 수 있음
    alert("공지사항이 성공적으로 등록되었습니다.");
    
    // 폼 초기화
    setTitle("");
    setContent("");
    setNoticeType("general");
    setPriority("normal");
    setStartDate("");
    setEndDate("");
    setAttachments([]);
    setTags([]);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">공지사항 작성</h1>
          <p className="text-gray-500 mt-1">
            새로운 공지사항을 작성하고 등록하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center h-10 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button className="inline-flex items-center h-10 px-4 bg-[#4990FF] text-white rounded-lg text-sm font-medium hover:bg-[#4990FF]/90 transition-colors">
            <Send className="w-4 h-4 mr-1.5" />
            등록하기
          </button>
        </div>
      </div>

      <div className="space-y-6 bg-white rounded-lg border-gray-100">
        {/* 공지 유형 및 상단 고정 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              상단 고정
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPinned"
                  value="true"
                  checked={priority === "high"}
                  onChange={() => setPriority("high")}
                  className="w-4 h-4 text-[#4990FF] focus:ring-[#4990FF]/20 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">고정</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPinned"
                  value="false"
                  checked={priority === "normal"}
                  onChange={() => setPriority("normal")}
                  className="w-4 h-4 text-[#4990FF] focus:ring-[#4990FF]/20 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">일반</span>
              </label>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지사항 제목을 입력하세요"
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지사항 내용을 입력하세요"
            rows={10}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
          />
        </div>

        {/* 첨부파일 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            첨부파일
          </label>
          <div className="border border-dashed border-gray-200 rounded-lg p-4">
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="text-sm text-gray-600">
                      {file.name} ({file.size})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                <Plus size={20} className="mx-auto mb-2 text-gray-400" />
                파일을 드래그하여 업로드하거나 파일 선택 버튼을 클릭하세요
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddAttachment}
            className="mt-2 inline-flex items-center h-10 px-4 border border-[#4990FF] text-[#4990FF] rounded-lg text-sm font-medium hover:bg-[#4990FF]/5 transition-colors"
          >
            <Plus size={16} className="mr-1.5" />
            파일 선택
          </button>
        </div>

        {/* 주의사항 */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              등록 전 확인사항
            </h3>
            <ul className="mt-1 text-sm text-amber-700 space-y-1">
              <li>• 공지사항 등록 후에도 수정이 가능합니다.</li>
              <li>• 긴급 공지는 앱/웹 사용자에게 알림이 발송됩니다.</li>
              <li>• 첨부파일은 최대 5개, 각 10MB 이하로 업로드 가능합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}