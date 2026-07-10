"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderOpen,
  Upload,
  ShieldCheck,
  RefreshCw,
  Search,
  Grid,
  List,
  Tag,
  Film,
  Volume2,
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Maximize2,
  Filter,
} from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface MediaFile {
  id: string
  name: string
  size: string
  res: string
  status: "VALID" | "CORRUPT" | "WARNING"
  codec: string
  duration: string
  bitrate: string
  fps: string
  audio: string
  tags: string[]
  uploadedAt: string
}

const initialFiles: MediaFile[] = [
  {
    id: "med_1",
    name: "ep_101_rainy_night_lofi.mp4",
    size: "1.42 GB",
    res: "1920x1080",
    status: "VALID",
    codec: "h264 (High Profile)",
    duration: "01:14:22",
    bitrate: "4,512 kbps",
    fps: "60.00 fps",
    audio: "aac (LC) @ 192 kbps 48kHz",
    tags: ["#lofi", "#night", "#rain"],
    uploadedAt: "2026-07-09 14:22:00",
  },
  {
    id: "med_2",
    name: "ep_102_lofi_mix.mp4",
    size: "1.45 GB",
    res: "1920x1080",
    status: "VALID",
    codec: "h264 (High Profile)",
    duration: "01:15:12",
    bitrate: "4,500 kbps",
    fps: "30.00 fps",
    audio: "aac (LC) @ 192 kbps 48kHz",
    tags: ["#lofi", "#study", "#chill"],
    uploadedAt: "2026-07-09 16:05:12",
  },
  {
    id: "med_3",
    name: "ep_103_chill_study_session.mp4",
    size: "2.10 GB",
    res: "3840x2160 (4K)",
    status: "VALID",
    codec: "hevc (Main 10 Profile)",
    duration: "02:04:10",
    bitrate: "6,800 kbps",
    fps: "60.00 fps",
    audio: "aac (LC) @ 256 kbps 48kHz",
    tags: ["#study", "#4k", "#ambient"],
    uploadedAt: "2026-07-10 01:12:44",
  },
  {
    id: "med_4",
    name: "corrupted_raw_clip_temp.mp4",
    size: "12.4 MB",
    res: "Unknown",
    status: "CORRUPT",
    codec: "Corrupted MOOV Atom",
    duration: "00:00:00",
    bitrate: "0 kbps",
    fps: "0 fps",
    audio: "None detected",
    tags: ["#temp", "#raw"],
    uploadedAt: "2026-07-10 03:15:02",
  },
  {
    id: "med_5",
    name: "ep_104_midnight_vibes.mp4",
    size: "890.5 MB",
    res: "1920x1080",
    status: "VALID",
    codec: "h264 (Main Profile)",
    duration: "00:48:30",
    bitrate: "4,480 kbps",
    fps: "30.00 fps",
    audio: "aac (LC) @ 160 kbps 44.1kHz",
    tags: ["#lofi", "#midnight", "#chill"],
    uploadedAt: "2026-07-10 04:02:18",
  },
]

export default function MediaLibraryPage() {
  const [files, setFiles] = React.useState<MediaFile[]>(initialFiles)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTag, setSelectedTag] = React.useState<string>("ALL")
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "VALID" | "CORRUPT">("ALL")
  const [selectedFile, setSelectedFile] = React.useState<MediaFile | null>(null)
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isScanning, setIsScanning] = React.useState(false)

  const allTags = React.useMemo(() => {
    const s = new Set<string>()
    files.forEach((f) => f.tags.forEach((t) => s.add(t)))
    return ["ALL", ...Array.from(s)]
  }, [files])

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.codec.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === "ALL" || f.tags.includes(selectedTag)
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter
    return matchesSearch && matchesTag && matchesStatus
  })

  const handleSimulatedUpload = () => {
    const newFile: MediaFile = {
      id: `med_${Date.now()}`,
      name: `ep_${Math.floor(105 + Math.random() * 50)}_uploaded_stream.mp4`,
      size: "1.68 GB",
      res: "1920x1080",
      status: "VALID",
      codec: "h264 (High Profile)",
      duration: "01:22:15",
      bitrate: "4,500 kbps",
      fps: "60.00 fps",
      audio: "aac (LC) @ 192 kbps 48kHz",
      tags: ["#lofi", "#upload", "#verified"],
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    }
    setFiles((prev) => [newFile, ...prev])
    setUploadOpen(false)
  }

  const handleRescan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 1200)
  }

  return (
    <DashboardShell>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="online" className="text-xs px-2.5 py-0.5 font-mono shadow-md">
              FFPROBE ENGINE ACTIVE
            </Badge>
            <span className="text-xs font-mono text-[#888888]">
              Automated Codec, FPS &amp; Corrupted Header Verification
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2.5">
            <FolderOpen className="h-6 w-6 text-[#FF5A1F]" /> Professional Media Explorer &amp; Validator
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            Deep container inspection (`mp4/mkv/flv`), audio stream validation, and tag organization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRescan}
            disabled={isScanning}
            className="text-xs font-mono h-9 bg-[#111111] border-[#1C1C1C]"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 text-[#FF5A1F] ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning Directory..." : "Re-Scan Directory (`ffprobe`)"}
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="text-xs font-bold h-9 shadow-lg px-4"
          >
            <Upload className="h-4 w-4 mr-1.5 fill-white" /> Upload Media
          </Button>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Tags & View Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111]/80 p-3.5 rounded-2xl border border-[#1C1C1C] backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search by filename, resolution, or codec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#090909] border border-[#1C1C1C] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF5A1F] font-mono transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex bg-[#090909] p-1 rounded-xl border border-[#1C1C1C] text-xs font-mono">
            {(["ALL", "VALID", "CORRUPT"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === st
                    ? "bg-[#FF5A1F] text-white font-bold"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                {st} ({st === "ALL" ? files.length : files.filter((f) => f.status === st).length})
              </button>
            ))}
          </div>

          {/* Tags Dropdown/Bar */}
          <div className="flex items-center gap-1 bg-[#090909] p-1 rounded-xl border border-[#1C1C1C] text-xs font-mono overflow-x-auto max-w-xs scrollbar-none">
            <Tag className="h-3.5 w-3.5 text-[#FF5A1F] ml-1 shrink-0" />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2 py-1 rounded transition-colors shrink-0 ${
                  selectedTag === tag
                    ? "bg-[#1C1C1C] text-[#FF5A1F] font-bold border border-[#FF5A1F]/40"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Grid vs List Toggle */}
          <div className="flex bg-[#090909] p-1 rounded-xl border border-[#1C1C1C]">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-[#FF5A1F] text-white" : "text-[#888888] hover:text-white"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="List View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-[#FF5A1F] text-white" : "text-[#888888] hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Files Display (Grid or List) */}
      {filteredFiles.length === 0 ? (
        <Card className="glass-card p-12 text-center text-xs font-mono text-[#888888] space-y-2">
          <AlertTriangle className="h-8 w-8 text-[#F59E0B] mx-auto" />
          <p>Zero media files found matching the search query `{searchQuery}` and tag filter `{selectedTag}`.</p>
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setSelectedTag("ALL"); setStatusFilter("ALL"); }}>
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedFile(file)}
              className="cursor-pointer"
            >
              <Card
                className={`glass-card flex flex-col justify-between h-64 overflow-hidden border transition-all ${
                  file.status === "VALID"
                    ? "border-[#1C1C1C] hover:border-[#FF5A1F]/60"
                    : "border-[#E53935]/60 bg-[#E53935]/5"
                }`}
              >
                {/* Card Header Thumbnail/Preview Banner */}
                <div className="relative h-28 bg-[#050505] border-b border-[#1C1C1C] flex items-center justify-between p-3 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#090909] via-[#141414] to-[#1f100a] opacity-80" />
                  
                  <div className="z-10 flex items-center gap-2.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      file.status === "VALID" ? "bg-[#FF5A1F]/15 border-[#FF5A1F]/40 text-[#FF5A1F]" : "bg-[#E53935]/20 border-[#E53935]/50 text-[#E53935]"
                    }`}>
                      <Film className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white text-xs truncate block">{file.name}</span>
                      <span className="text-[10px] text-[#888888] block">{file.uploadedAt}</span>
                    </div>
                  </div>

                  <Badge
                    variant={file.status === "VALID" ? "success" : "destructive"}
                    className="z-10 shrink-0 text-[10px] px-2 py-0.5 shadow-md"
                  >
                    {file.status}
                  </Badge>
                </div>

                {/* Card Content: High Density ffprobe Metadata */}
                <CardContent className="p-3.5 space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-[#090909] border border-[#1C1C1C] flex justify-between">
                      <span className="text-[#888888]">Res:</span>
                      <span className="text-white font-bold">{file.res}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#090909] border border-[#1C1C1C] flex justify-between">
                      <span className="text-[#888888]">Duration:</span>
                      <span className="text-[#10B981] font-bold">{file.duration}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#090909] border border-[#1C1C1C] flex justify-between">
                    <span className="text-[#888888]">Codec:</span>
                    <span className="text-white truncate max-w-[170px]">{file.codec}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {file.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-[#181818] border border-[#1C1C1C] text-[#FF5A1F] text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View Mode */
        <Card className="glass-card overflow-hidden border border-[#1C1C1C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1C1C1C] bg-[#111111] text-[#888888] uppercase text-[11px]">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Resolution</th>
                  <th className="py-3 px-4">Codec</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Bitrate / FPS</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]/60 text-white">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="hover:bg-[#181818]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <Badge variant={file.status === "VALID" ? "success" : "destructive"} className="text-[10px]">
                        {file.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#F5F5F5] group-hover:text-[#FF5A1F] transition-colors truncate max-w-[220px]">
                      {file.name}
                    </td>
                    <td className="py-3 px-4 text-[#CCCCCC]">{file.res}</td>
                    <td className="py-3 px-4 text-[#CCCCCC]">{file.codec}</td>
                    <td className="py-3 px-4 text-[#10B981] font-bold">{file.duration}</td>
                    <td className="py-3 px-4 text-[#888888]">{file.bitrate} ({file.fps})</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {file.tags.slice(0, 2).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-[#090909] border border-[#1C1C1C] text-[#FF5A1F] text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-[#888888] hover:text-white">
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* File Inspection Metadata Modal Drawer (`selectedFile`) */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-lg bg-[#111111] border-[#1C1C1C] font-mono text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Film className="h-5 w-5 text-[#FF5A1F]" /> Media Inspection Report (`ffprobe`)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete stream header analysis, GOP structure, and audio track validation
            </DialogDescription>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-xl bg-[#090909] border border-[#1C1C1C] space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#1C1C1C] pb-2">
                  <span className="text-[#888888]">Target Container:</span>
                  <span className="font-bold text-white text-sm truncate max-w-[260px]">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">File Size / Storage:</span>
                  <span className="text-white font-bold">{selectedFile.size} (NVMe Array)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Resolution / Aspect:</span>
                  <span className="text-white font-bold">{selectedFile.res} (16:9)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Video Codec Stream:</span>
                  <span className="text-[#FF5A1F] font-bold">{selectedFile.codec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Audio Stream (`-ac 2`):</span>
                  <span className="text-[#10B981] font-bold">{selectedFile.audio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Stream Bitrate:</span>
                  <span className="text-white">{selectedFile.bitrate} @ {selectedFile.fps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">ffprobe Integrity:</span>
                  <span className={selectedFile.status === "VALID" ? "text-[#10B981] font-bold" : "text-[#E53935] font-bold"}>
                    {selectedFile.status === "VALID" ? "PASSED (0 Corrupted Atoms)" : "FAILED (MOOV Atom Missing)"}
                  </span>
                </div>
              </div>

              {selectedFile.status === "CORRUPT" && (
                <div className="p-3 rounded-xl bg-[#E53935]/10 border border-[#E53935]/40 text-[#E53935] flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    CRITICAL: This file has a missing or damaged `moov` atom header. It has been automatically skipped by `MediaValidator` to prevent worker crashes.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFile(null)}>
              Close Inspector
            </Button>
            {selectedFile?.status === "VALID" && (
              <Button variant="glow" onClick={() => setSelectedFile(null)}>
                Append to Active Concat Playlist
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Media Simulator Modal with Drag & Drop */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md bg-[#111111] border-[#1C1C1C]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-[#FF5A1F]" /> Upload Media to Pipeline Array
            </DialogTitle>
            <DialogDescription className="text-xs">
              Uploaded `.mp4`, `.mkv`, or `.flv` files undergo automatic `ffprobe` header verification before ingestion into active loops.
            </DialogDescription>
          </DialogHeader>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSimulatedUpload(); }}
            onClick={handleSimulatedUpload}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? "border-[#FF5A1F] bg-[#FF5A1F]/10 scale-[1.02]" : "border-[#1C1C1C] hover:border-[#FF5A1F]/50 bg-[#090909]"
            }`}
          >
            <div className="h-14 w-14 rounded-2xl bg-[#111111] border border-[#1C1C1C] flex items-center justify-center mx-auto shadow-xl">
              <Upload className="h-6 w-6 text-[#FF5A1F]" />
            </div>
            <h4 className="mt-4 font-bold text-white text-sm font-mono">
              Drag &amp; drop video file here, or click to browse
            </h4>
            <p className="text-xs text-[#888888] mt-1.5 font-mono">
              Supported containers: MP4, MKV, FLV • Max file size: 50 GB
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadOpen(false)} className="text-xs font-mono">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
