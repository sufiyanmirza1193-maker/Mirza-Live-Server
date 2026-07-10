"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Trash2,
  Plus,
  Clock,
  FileVideo,
  CheckCircle2,
  Copy,
  Repeat,
  Shuffle,
  Play,
  Film,
  Sliders,
  Sparkles,
  Volume2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface PlaylistItem {
  id: string
  filename: string
  durationSec: number
  resolution: string
  codec: string
  corrupted: boolean
  color: string
}

function SortablePlaylistItem({
  item,
  onRemove,
  onSelect,
  isSelected,
}: {
  item: PlaylistItem
  onRemove: (id: string) => void
  onSelect: (item: PlaylistItem) => void
  isSelected: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.85 : 1,
  }

  const formatSec = (sec: number) => {
    const hrs = Math.floor(sec / 3600)
    const mins = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${hrs > 0 ? hrs + "h " : ""}${mins}m ${s}s`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(item)}
      className={`p-3.5 rounded-xl bg-[#090909] border flex items-center justify-between transition-all group font-mono text-xs cursor-pointer ${
        isDragging
          ? "border-[#FF5A1F] shadow-2xl scale-[1.01]"
          : isSelected
          ? "border-[#FF5A1F] bg-[#111111] shadow-lg shadow-[#FF5A1F]/10"
          : "border-[#1C1C1C] hover:border-[#1C1C1C]/80"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-[#888888] hover:text-white p-1"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-[#1C1C1C]"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          <FileVideo className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <span className="text-white font-bold block truncate max-w-[180px] sm:max-w-xs group-hover:text-[#FF5A1F] transition-colors">
            {item.filename}
          </span>
          <span className="text-[10px] text-[#888888]">
            {item.resolution} • {item.codec}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[#888888] flex items-center gap-1 font-bold">
          <Clock className="h-3 w-3 text-[#10B981]" /> {formatSec(item.durationSec)}
        </span>
        <Badge variant={item.corrupted ? "destructive" : "online"} className="text-[10px] px-2 py-0.5">
          {item.corrupted ? "CORRUPT" : "VALID"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
          className="h-7 w-7 text-[#888888] hover:text-[#E53935]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function PlaylistBuilder() {
  const [items, setItems] = React.useState<PlaylistItem[]>([
    { id: "clip_1", filename: "ep_101_rainy_night_lofi.mp4", durationSec: 4462, resolution: "1920x1080", codec: "h264/aac", corrupted: false, color: "#FF5A1F" },
    { id: "clip_2", filename: "ep_102_lofi_mix.mp4", durationSec: 4512, resolution: "1920x1080", codec: "h264/aac", corrupted: false, color: "#10B981" },
    { id: "clip_3", filename: "ep_103_chill_study_session.mp4", durationSec: 7450, resolution: "3840x2160", codec: "hevc/aac", corrupted: false, color: "#3B82F6" },
  ])
  const [selectedItem, setSelectedItem] = React.useState<PlaylistItem>(items[0])
  const [repeatMode, setRepeatMode] = React.useState<"infinite" | "once">("infinite")
  const [shuffleMode, setShuffleMode] = React.useState<"sequential" | "shuffle">("sequential")
  const [transitionType, setTransitionType] = React.useState<"crossfade" | "hard" | "black">("crossfade")
  const [copied, setCopied] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleAddSample = () => {
    const colors = ["#FF5A1F", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"]
    const newId = `clip_${Date.now()}`
    const newItem: PlaylistItem = {
      id: newId,
      filename: `ep_${104 + items.length}_midnight_vibes.mp4`,
      durationSec: Math.floor(2800 + Math.random() * 3000),
      resolution: "1920x1080",
      codec: "h264/aac",
      corrupted: false,
      color: colors[items.length % colors.length],
    }
    setItems((prev) => [...prev, newItem])
    setSelectedItem(newItem)
  }

  const totalDurationSec = items.reduce((acc, i) => acc + i.durationSec, 0)
  const formatTotalTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600)
    const mins = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const concatSyntax = items
    .map((item) => `file 'C:/live channel/mirza_live_server/media/lofi_mix/${item.filename}'`)
    .join("\n")

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Repeat, Shuffle & Transition Controls */}
      <Card className="glass-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#888888] uppercase text-[11px]">Repeat Mode:</span>
              <Button
                variant={repeatMode === "infinite" ? "glow" : "outline"}
                size="sm"
                onClick={() => setRepeatMode(repeatMode === "infinite" ? "once" : "infinite")}
                className="h-8 text-xs font-bold"
              >
                <Repeat className={`h-3.5 w-3.5 mr-1.5 ${repeatMode === "infinite" ? "animate-spin" : ""}`} />
                {repeatMode === "infinite" ? "Infinite Loop (`-stream_loop -1`)" : "Play Once & Exit"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#888888] uppercase text-[11px]">Order:</span>
              <Button
                variant={shuffleMode === "shuffle" ? "glow" : "outline"}
                size="sm"
                onClick={() => {
                  if (shuffleMode === "sequential") {
                    setShuffleMode("shuffle")
                    setItems((prev) => [...prev].sort(() => Math.random() - 0.5))
                  } else {
                    setShuffleMode("sequential")
                  }
                }}
                className="h-8 text-xs font-bold"
              >
                <Shuffle className="h-3.5 w-3.5 mr-1.5" />
                {shuffleMode === "shuffle" ? "Smart Shuffle Active" : "Sequential Order"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#888888] uppercase text-[11px]">Clip Transitions:</span>
            <div className="flex bg-[#090909] p-1 rounded-lg border border-[#1C1C1C]">
              {[
                { id: "crossfade", label: "Crossfade (2.0s)" },
                { id: "hard", label: "Hard Cut" },
                { id: "black", label: "Fade to Black (1s)" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTransitionType(t.id as any)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                    transitionType === t.id
                      ? "bg-[#FF5A1F] text-white font-bold"
                      : "text-[#888888] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Timeline Visual Sequence Waveform Bar */}
      <Card className="glass-card p-4 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center">
          <span className="text-[#888888] uppercase text-[11px] font-bold flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-[#FF5A1F]" /> Sequence Timeline Waveform (`{items.length} clips total`)
          </span>
          <span className="text-white font-bold">Total Duration: {formatTotalTime(totalDurationSec)}</span>
        </div>

        <div className="h-10 w-full bg-[#050505] rounded-xl border border-[#1C1C1C] flex overflow-hidden p-1 gap-1">
          {items.map((item, idx) => {
            const pct = Math.max(8, (item.durationSec / totalDurationSec) * 100)
            const isSel = selectedItem?.id === item.id
            return (
              <motion.div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`h-full rounded-lg flex items-center justify-center px-2 cursor-pointer transition-all relative overflow-hidden group ${
                  isSel ? "ring-2 ring-white shadow-lg z-10" : "opacity-80 hover:opacity-100"
                }`}
                style={{ width: `${pct}%`, backgroundColor: `${item.color}30`, border: `1px solid ${item.color}80` }}
              >
                <span className="text-[10px] font-bold truncate text-white drop-shadow">
                  #{idx + 1} {item.filename}
                </span>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag and Drop Sequence Builder */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#1C1C1C]">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <FileVideo className="h-4 w-4 text-[#FF5A1F]" /> Concat Queue (`@dnd-kit` Drag-to-Sort)
              </CardTitle>
              <CardDescription className="text-xs">
                Drag items to re-order the broadcast sequence. Click any clip to preview.
              </CardDescription>
            </div>
            <Button variant="glow" size="sm" onClick={handleAddSample} className="text-xs font-bold h-8">
              <Plus className="h-3.5 w-3.5 mr-1 fill-white" /> Append Clip
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <SortablePlaylistItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onSelect={setSelectedItem}
                    isSelected={selectedItem?.id === item.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Selected Item Video Preview Player Simulation & Windows Concat Syntax */}
        <div className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#1C1C1C]">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="h-4 w-4 text-[#10B981]" /> Selected Item Video Preview
              </CardTitle>
              <CardDescription className="text-xs">
                Simulated FFmpeg decoding check for item `{selectedItem?.filename || "None"}`
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 font-mono text-xs">
              <div className="relative aspect-video rounded-xl bg-[#050505] border border-[#1C1C1C] overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-40 animate-pulse"
                  style={{ backgroundColor: `${selectedItem?.color || "#FF5A1F"}20` }}
                />
                
                <div className="z-10 text-center space-y-2 p-4">
                  <div className="h-12 w-12 rounded-xl bg-[#111111] border border-[#1C1C1C] flex items-center justify-center mx-auto shadow-xl">
                    <Film className="h-6 w-6" style={{ color: selectedItem?.color || "#FF5A1F" }} />
                  </div>
                  <span className="text-xs font-bold text-white block truncate max-w-[200px]">
                    {selectedItem?.filename}
                  </span>
                  <Badge variant="online" className="text-[10px] px-2 py-0.5">
                    {selectedItem?.resolution} • {selectedItem?.codec}
                  </Badge>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] bg-[#090909]/80 px-2.5 py-1 rounded border border-[#1C1C1C]">
                  <span className="text-[#10B981] flex items-center gap-1 font-bold">
                    <Volume2 className="h-3 w-3" /> AAC 48kHz
                  </span>
                  <span className="text-white font-bold">{formatTotalTime(selectedItem?.durationSec || 0)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#888888]">
                  <span>Item Order:</span>
                  <span className="text-white font-bold">
                    #{items.findIndex((i) => i.id === selectedItem?.id) + 1} of {items.length}
                  </span>
                </div>
                <div className="flex justify-between text-[#888888]">
                  <span>Transition Out:</span>
                  <span className="text-[#FF5A1F] font-bold capitalize">{transitionType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Windows Concat File Output */}
          <Card className="glass-card flex flex-col justify-between font-mono text-xs">
            <CardHeader className="pb-3 border-b border-[#1C1C1C]">
              <CardTitle className="text-sm font-bold text-white">Generated `concat.txt` Syntax</CardTitle>
              <CardDescription className="text-xs">
                Injected into `-f concat -safe 0 -i concat.txt`
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-[#888888] uppercase">
                <span>Windows Absolute Paths</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(concatSyntax)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="text-[#FF5A1F] flex items-center gap-1 hover:underline font-bold"
                >
                  <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy File"}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] text-[10px] text-[#F5F5F5] overflow-x-auto max-h-40 leading-relaxed select-all scrollbar-thin">
                {concatSyntax}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
