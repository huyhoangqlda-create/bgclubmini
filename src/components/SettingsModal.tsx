import React, { useState } from 'react';
import { X, Globe, BookOpen, RotateCcw, Trash2, Download, Upload, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { AppState } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  courts: number;
  sameType: boolean;
  state: AppState;
  onClose: () => void;
  onCourtsChange: (courts: number) => void;
  onToggleSameType: () => void;
  onNewSession: () => void;
  onWipeData: () => void;
  onRestoreState: (state: AppState) => void;
  onToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  courts,
  sameType,
  state,
  onClose,
  onCourtsChange,
  onToggleSameType,
  onNewSession,
  onWipeData,
  onRestoreState,
  onToast,
}) => {
  const [showNetlifyGuide, setShowNetlifyGuide] = useState(false);
  const [showRules, setShowRules] = useState(false);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `bgclub-tournament-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onToast('Đã xuất file sao lưu dữ liệu giải đấu!');
    } catch {
      onToast('Không thể xuất file sao lưu.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.players)) {
          onRestoreState(parsed);
          onToast('Đã khôi phục dữ liệu thành công!');
          onClose();
        } else {
          onToast('File sao lưu không đúng định dạng.');
        }
      } catch {
        onToast('Lỗi khi đọc file sao lưu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 bg-[#0e1624]/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#f3f1ec] w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#e3e0d8] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-[#e3e0d8] flex items-center justify-between">
          <h3 className="font-extrabold text-[#14233a] text-base">Cài đặt giải đấu</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#eeece6] flex items-center justify-center text-[#5b6676] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-[#14233a]">
          {/* Court count */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] flex items-center justify-between gap-4">
            <div>
              <span className="font-bold block text-sm">Số sân thi đấu</span>
              <span className="text-xs text-[#5b6676] block mt-0.5">
                Số trận diễn ra cùng lúc (từ 1 đến 8 sân)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCourtsChange(Math.max(1, courts - 1))}
                disabled={courts <= 1}
                className="w-9 h-9 rounded-xl bg-[#eeece6] hover:bg-[#e3e0d8] disabled:opacity-30 font-bold text-lg flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center font-extrabold text-base font-mono tabular-nums">
                {courts}
              </span>
              <button
                type="button"
                onClick={() => onCourtsChange(Math.min(8, courts + 1))}
                disabled={courts >= 8}
                className="w-9 h-9 rounded-xl bg-[#eeece6] hover:bg-[#e3e0d8] disabled:opacity-30 font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Same Type Prioritization */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] flex items-center justify-between gap-4">
            <div className="pr-2">
              <span className="font-bold block text-sm">Ưu tiên đối đầu cùng loại</span>
              <span className="text-xs text-[#5b6676] block mt-0.5 leading-relaxed">
                Đôi Nam A+B gặp Nam A+B, Đôi Nam+Nữ gặp Nam+Nữ. Chỉ ghép chéo khi cần để người chưa ra sân được vào.
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleSameType}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                sameType ? 'bg-[#2f8f5b]' : 'bg-[#d8d5cc]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  sameType ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Netlify Deployment Section */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#c9a44c]/40 space-y-3">
            <button
              type="button"
              onClick={() => setShowNetlifyGuide(!showNetlifyGuide)}
              className="w-full flex items-center justify-between font-bold text-sm text-[#14233a]"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00ad9f]" />
                Cấu hình triển khai trên Netlify
              </span>
              {showNetlifyGuide ? (
                <ChevronUp className="w-4 h-4 text-[#5b6676]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#5b6676]" />
              )}
            </button>

            {showNetlifyGuide ? (
              <div className="pt-2 text-xs text-[#5b6676] space-y-2.5 border-t border-[#e3e0d8] leading-relaxed">
                <div className="flex items-center gap-1.5 text-[#2f8f5b] font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  Dự án đã sẵn sàng 100% với file <code className="bg-[#f3f1ec] px-1 py-0.5 rounded text-[#14233a]">netlify.toml</code> và <code className="bg-[#f3f1ec] px-1 py-0.5 rounded text-[#14233a]">_redirects</code>.
                </div>
                <div>
                  <b>Cách 1: Triển khai qua GitHub (Khuyên dùng)</b>
                  <ol className="list-decimal pl-4 mt-1 space-y-1">
                    <li>Đẩy code lên kho lưu trữ GitHub của bạn.</li>
                    <li>Truy cập <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-[#1f3a5f] underline font-semibold">app.netlify.com</a> và chọn <b>Add new site</b> → <b>Import an existing project</b>.</li>
                    <li>Chọn kho GitHub vừa đẩy. Netlify sẽ tự động nhận diện:
                      <ul className="list-disc pl-4 mt-0.5 text-[#14233a]">
                        <li><b>Build command:</b> <code>npm run build</code></li>
                        <li><b>Publish directory:</b> <code>dist</code></li>
                      </ul>
                    </li>
                    <li>Bấm <b>Deploy Site</b> là hoàn tất!</li>
                  </ol>
                </div>

                <div>
                  <b>Cách 2: Triển khai trực tiếp (Netlify Drop)</b>
                  <p className="mt-0.5">
                    Chạy <code>npm run build</code> để tạo thư mục <code>dist</code>, sau đó kéo thả thư mục <code>dist</code> vào <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-[#1f3a5f] underline font-semibold">app.netlify.com/drop</a> để có link web ngay lập tức mà không cần tài khoản GitHub!
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5b6676]">
                Đã tích hợp sẵn cấu hình SPA routing và build tự động cho Netlify. Bấm để xem chi tiết các bước.
              </p>
            )}
          </div>

          {/* Rules Accordion */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-2">
            <button
              type="button"
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-between font-bold text-sm text-[#14233a]"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#c9a44c]" />
                Luật chơi & nguyên tắc xoay vòng
              </span>
              {showRules ? (
                <ChevronUp className="w-4 h-4 text-[#5b6676]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#5b6676]" />
              )}
            </button>

            {showRules && (
              <div className="pt-2 text-xs text-[#5b6676] space-y-2 border-t border-[#e3e0d8] leading-relaxed">
                <p>
                  • <b>Ghép cặp đôi:</b> 3 rổ thăm (Nam A, Nam B, Nữ). Mỗi cặp đấu gồm <b>Nam A + Nữ</b>, <b>Nam B + Nữ</b>, hoặc <b>Nữ + Nữ</b>.
                </p>
                <p>
                  • <b>Xoay vòng lượt chơi:</b> Chỉ tính những người đang chờ, không tính thời gian chờ; ưu tiên người có số lượt ra sân ít nhất để đảm bảo cơ hội ra sân công bằng cho mọi thành viên.
                </p>
                <p>
                  • <b>Chỉnh sửa thủ công:</b> Người quản lý có thể tự do bấm nút <b>Ghép thủ công</b> trên sân trống, <b>Sửa / Đổi người</b> trên sân đang đấu, hoặc chỉnh sửa số lượt / đổi tên người chơi bất cứ khi nào cần.
                </p>
                <p>
                  • <b>Hạn chế trùng lặp:</b> Thuật toán tự động tính điểm phạt để giảm tối đa việc chung đội hoặc đối đầu với cùng 1 người nhiều lần liên tiếp.
                </p>
                <p>
                  • <b>Chạm 15 điểm:</b> Mỗi trận kết thúc khi một đội chạm 15 điểm.
                </p>
              </div>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-2.5">
            <span className="font-bold block text-sm">Sao lưu & Khôi phục dữ liệu</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 py-2 px-3 rounded-xl border border-[#e3e0d8] hover:bg-[#eeece6] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#14233a]" />
                Tải file sao lưu
              </button>

              <label className="flex-1 py-2 px-3 rounded-xl border border-[#e3e0d8] hover:bg-[#eeece6] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#14233a]" />
                <span>Nhập sao lưu</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Destructive Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onNewSession}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white hover:bg-[#faf9f6] border border-[#e3e0d8] text-[#14233a] flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[#c9a44c]" />
              Ván mới — Giữ danh sách, xóa kết quả
            </button>

            <button
              type="button"
              onClick={onWipeData}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#fbeceb] hover:bg-[#f7d6d4] text-[#c2453b] flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Xóa toàn bộ người chơi và dữ liệu
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-3 border-t border-[#e3e0d8]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-[#14233a] hover:bg-[#1f3a5f] text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
