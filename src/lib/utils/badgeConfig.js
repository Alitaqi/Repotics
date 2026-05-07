import {
  Shield,
  Star,
  Flame,
  Crown,
  Skull,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

// 🔁 MAP backend badge names → frontend keys
export const BADGE_NAME_MAP = {
  "Rookie Reporter": "batman",
  "Active Reporter": "reporter-1",
  "Elite Reporter": "reporter-2",

  "First Voice": "active-voice",
  "Community Voice": "top-contributor",

  "Trusted Reporter": "trusted-reporter",
  "Public Hero": "legend",

  "Controversial": "controversial",
};

// 🎨 VISUAL CONFIG (unchanged)
export const BADGE_CONFIG = {
  batman: {
    label: "Rookie",
    color: "bg-gray-200 text-gray-800",
    icon: Shield,
  },

  "reporter-1": {
    label: "Reporter I",
    color: "bg-blue-100 text-blue-700",
    icon: Star,
  },

  "reporter-2": {
    label: "Reporter II",
    color: "bg-blue-200 text-blue-800",
    icon: Star,
  },

  "top-contributor": {
    label: "Top Contributor",
    color: "bg-purple-100 text-purple-700",
    icon: Crown,
  },

  "trusted-reporter": {
    label: "Trusted",
    color: "bg-green-100 text-green-700",
    icon: ThumbsUp,
  },

  "active-voice": {
    label: "Active Voice",
    color: "bg-yellow-100 text-yellow-700",
    icon: MessageCircle,
  },

  "legend": {
    label: "Legend",
    color: "bg-gradient-to-r from-orange-400 to-red-500 text-white",
    icon: Flame,
  },

  "controversial": {
    label: "Controversial",
    color: "bg-red-100 text-red-700",
    icon: Skull,
  },
};