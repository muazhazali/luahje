export interface UnsentMessage {
  id: string
  to: string
  message: string
  color: string
  createdAt: string
}

export type SortMode = "newest" | "oldest" | "random"

export const MESSAGE_COLORS = [
  { name: "Rose", value: "#E63946" },
  { name: "Coral", value: "#F4845F" },
  { name: "Peach", value: "#F7B267" },
  { name: "Sunflower", value: "#F7D070" },
  { name: "Mint", value: "#7EC8A0" },
  { name: "Sage", value: "#8DB580" },
  { name: "Sky", value: "#5DADE2" },
  { name: "Ocean", value: "#457B9D" },
  { name: "Lavender", value: "#B39DDB" },
  { name: "Plum", value: "#9B59B6" },
  { name: "Blush", value: "#F8AFA6" },
  { name: "Slate", value: "#6C7A89" },
] as const

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff"
}
