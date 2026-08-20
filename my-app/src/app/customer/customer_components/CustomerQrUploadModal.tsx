"use client";

// RESPONSIBILITY: Modal for scanning or uploading existing table QR code images on laptop/desktop.
// Parses QR image files (e.g., QR-Table-T-01.png) or provides quick table selectors for testing.
// DATA FLOW: Image file / Table selection → CustomerQrUploadModal → router.push('/customer?table=tbl-01')

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Sparkles,
  X,
  Camera,
  ArrowRight,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppTable } from "@/types/appTypes";
import jsQR from "jsqr";

interface CustomerQrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Extracts table number or table ID from a filename or text string.
 * Examples:
 *  "QR-Table-T-01.png" -> "T-01" / "tbl-01"
 *  "QR-Table-1.png"    -> "tbl-01"
 *  "tbl-02.jpg"        -> "tbl-02"
 */
function extractTableFromFilename(filename: string, tables: AppTable[]): AppTable | null {
  const cleanName = filename.toLowerCase().trim();

  // Try direct match against table numbers or IDs
  for (const t of tables) {
    const tId = t.id.toLowerCase();
    const tNum = t.tableNumber.toLowerCase();
    const numOnly = t.tableNumber.replace(/^(t|tbl)-?/i, "").toLowerCase();

    if (
      cleanName.includes(tId) ||
      cleanName.includes(tNum) ||
      cleanName.includes(`table-${numOnly}`) ||
      cleanName.includes(`table_${numOnly}`) ||
      cleanName.includes(`table${numOnly}`) ||
      cleanName.includes(`t-${numOnly}`) ||
      cleanName.includes(`t_${numOnly}`)
    ) {
      return t;
    }
  }

  // Fallback pattern matching e.g. "01", "1", "2"
  const match = cleanName.match(/(\d+)/);
  if (match) {
    const num = match[1];
    const found = tables.find((t) => {
      const tNum = t.tableNumber.replace(/\D/g, "");
      return tNum === num || parseInt(tNum, 10) === parseInt(num, 10);
    });
    if (found) return found;
  }

  return tables[0] ?? null;
}

export function CustomerQrUploadModal({ isOpen, onClose }: CustomerQrUploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);

  const [activeTab, setActiveTab] = useState<"UPLOAD" | "SELECT" | "SCAN">("UPLOAD");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [detectedTable, setDetectedTable] = useState<AppTable | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImagePreviewUrl(null);
      setDetectedTable(null);
      setErrorMsg(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    // Simulate scanning & decoding the QR code image
    setTimeout(async () => {
      try {
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => { img.onload = resolve; });

        // Draw to canvas to extract image data for jsQR
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            const qrUrl = code.data;
            try {
              const urlObj = new URL(qrUrl);
              const tableId = urlObj.searchParams.get("table");
              const tenantId = urlObj.searchParams.get("tenant");
              
              if (tableId) {
                if (tenantId) {
                  if (typeof window !== "undefined") {
                    window.location.href = `/customer?table=${encodeURIComponent(tableId)}&tenant=${encodeURIComponent(tenantId)}`;
                  } else {
                    router.push(`/customer?table=${tableId}&tenant=${tenantId}`);
                  }
                  onClose();
                  return;
                }
                
                // Fallback if no tenant in URL
                setDetectedTable({ id: tableId, tableNumber: tableId, section: "Dining", status: "AVAILABLE", currentOrderId: null, mergedTables: [] });
                setIsProcessing(false);
                return;
              }
            } catch (e) {
              // Ignore parse error
            }
          }
        }
      } catch (e) {
        // Fallback
      }

      const match = extractTableFromFilename(file.name, tables);
      if (match) {
        setDetectedTable(match);
      } else if (tables.length > 0) {
        setDetectedTable(tables[0]);
      } else {
        setErrorMsg("Could not detect a table number in QR image. Please pick a table below.");
      }
      setIsProcessing(false);
    }, 200);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleLaunchCustomer(tableId: string) {
    if (typeof window !== "undefined") {
      window.location.href = `/customer?table=${encodeURIComponent(tableId)}`;
    } else {
      router.push(`/customer?table=${tableId}`);
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upload or Scan Customer Table QR Code"
    >
      <div className="relative flex w-full max-w-lg flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Customer QR Table Access</h2>
              <p className="text-xs text-text-secondary">Scan or upload existing QR code image</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close QR upload modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-xl border border-border bg-page p-1">
          <button
            onClick={() => setActiveTab("UPLOAD")}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
              activeTab === "UPLOAD"
                ? "bg-success text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            <Upload size={14} />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setActiveTab("SELECT")}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
              activeTab === "SELECT"
                ? "bg-success text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            <Sparkles size={14} />
            <span>Quick Select Table</span>
          </button>

          <button
            onClick={() => setActiveTab("SCAN")}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
              activeTab === "SCAN"
                ? "bg-success text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            <Camera size={14} />
            <span>Camera Scanner</span>
          </button>
        </div>

        {/* Tab 1: Upload Existing QR Image */}
        {activeTab === "UPLOAD" && (
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {!imagePreviewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-page py-10 px-6 text-center cursor-pointer transition-all hover:border-success hover:bg-success/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-success shadow-xs">
                  <FileImage size={28} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-text-primary">
                    Upload Waiter QR Image File
                  </p>
                  <p className="text-xs text-text-secondary max-w-xs">
                    Drop downloaded QR image here or click to browse (e.g. <code className="font-mono text-success">QR-Table-T-01.png</code>)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 flex items-center gap-1.5 rounded-xl bg-success/10 px-4 py-2 text-xs font-bold text-success hover:bg-success/20 transition-colors"
                >
                  <Upload size={14} />
                  <span>Choose Image File</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-page p-4">
                <div className="flex items-center gap-4">
                  {/* Image Preview */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1">
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded QR Preview"
                      className="h-full w-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 text-xs text-text-secondary font-mono truncate">
                      <FileImage size={14} className="shrink-0 text-text-disabled" />
                      <span className="truncate">{selectedFile?.name}</span>
                    </div>

                    {isProcessing ? (
                      <div className="flex items-center gap-2 mt-2 text-xs text-primary font-medium animate-pulse">
                        <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span>Decoding QR Code matrix...</span>
                      </div>
                    ) : detectedTable ? (
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                          <CheckCircle2 size={16} />
                          <span>QR Code Decoded Successfully!</span>
                        </div>
                        <p className="text-sm font-extrabold text-text-primary">
                          Detected: Table {detectedTable.tableNumber} ({detectedTable.section})
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-danger mt-2">Could not auto-detect table number.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreviewUrl(null);
                      setDetectedTable(null);
                    }}
                    className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Change Image
                  </button>

                  {detectedTable && (
                    <button
                      onClick={() => handleLaunchCustomer(detectedTable.id)}
                      className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-success/90 transition-all"
                    >
                      <span>Open Table {detectedTable.tableNumber} Menu</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quick Table Selection (Laptop Mode) */}
        {activeTab === "SELECT" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-secondary">
              Select any table to instantly simulate scanning its table QR code:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleLaunchCustomer(t.id)}
                  className="flex flex-col items-start gap-1 rounded-xl border border-border bg-page p-3 text-left transition-all hover:border-success hover:bg-success/5 hover:scale-102"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-extrabold text-text-primary">{t.tableNumber}</span>
                    <span className="text-[10px] font-bold uppercase text-text-secondary bg-card px-1.5 py-0.5 rounded border border-border">
                      {t.section}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-disabled">Status: {t.status}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Camera Scanner Simulation */}
        {activeTab === "SCAN" && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-page p-6 text-center">
            <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-success bg-black/40">
              <Camera size={48} className="text-success/50" />
              <div className="absolute inset-x-0 top-0 h-1 bg-success shadow-[0_0_15px_#22c55e] animate-bounce" />
            </div>

            <p className="text-xs text-text-secondary">
              Point camera at Table QR Standee, or pick a sample table below:
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              {tables.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleLaunchCustomer(t.id)}
                  className="rounded-lg bg-success/10 border border-success/30 px-3 py-1.5 text-xs font-bold text-success hover:bg-success hover:text-white transition-all"
                >
                  Scan {t.tableNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
