"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetTrendingCrimesQuery } from "@/lib/redux/api/feedApi";
import { useState } from "react";
import { useGetPostByIdQuery } from "@/lib/redux/api/dashboardApi";
import PostModal from "@/components/layout/PostModal";
import { useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Lock,
  Smartphone,
  Eye,
  MapPin, Phone, FileText, Slash, UserCheck, CreditCard, ShieldCheck, Key, RefreshCw, Users,  Coffee, Home, Sun, Camera, Briefcase, MessageSquare, PhoneCall, AlertCircle, Wallet, Receipt, XCircle, Clock, ShieldOff, PhoneOff, EyeOff,Search, UserPlus, Heart, Trash2, Building, Bell, ShieldAlert, Edit3
} from "lucide-react";

const RightSidebar = () => {
  const { data, isLoading } = useGetTrendingCrimesQuery();
  const trendingCrimes = data?.data || [];

  const [selectedPostId, setSelectedPostId] = useState(null);

  // fetch full post ONLY when clicked
  const { data: postData } = useGetPostByIdQuery(selectedPostId, {
    skip: !selectedPostId,
  });

  const tipsByCategory = {
    Theft: [
      { text: "Keep valuables out of sight in parked cars.", icon: Lock, severity: "high" },
      { text: "Avoid parking in poorly lit areas.", icon: Lock, severity: "high" },
      { text: "Install anti-theft alarms in vehicles.", icon: Shield, severity: "medium" },
    ],
    Murder: [
      { text: "Report any direct or indirect death threats to police.", icon: ShieldAlert, severity: "high" },
      { text: "Avoid high-crime areas known for violent activity.", icon: MapPin, severity: "high" },
      { text: "Maintain communication with family about your whereabouts.", icon: Phone, severity: "medium" },
    ],
    Harassment: [
      { text: "Keep a detailed log of dates, times, and incidents.", icon: FileText, severity: "medium" },
      { text: "Block the individual on all social media and phone lines.", icon: Slash, severity: "high" },
      { text: "Report persistent behavior to HR or local authorities.", icon: Shield, severity: "high" },
    ],
    Fraud: [
      { text: "Never share PINs or passwords with anyone.", icon: Key, severity: "high" },
      { text: "Verify the identity of anyone asking for money via phone.", icon: UserCheck, severity: "high" },
      { text: "Check bank statements regularly for unknown charges.", icon: CreditCard, severity: "medium" },
    ],
    Cybercrime: [
      { text: "Enable 2FA on all important accounts.", icon: Smartphone, severity: "high" },
      { text: "Never click suspicious links in emails.", icon: AlertTriangle, severity: "high" },
      { text: "Use a reputable VPN on public Wi-Fi networks.", icon: ShieldCheck, severity: "medium" },
    ],
    Kidnapping: [
      { text: "Avoid predictable daily routines or travel paths.", icon: RefreshCw, severity: "medium" },
      { text: "Teach children never to talk to or go with strangers.", icon: Users, severity: "high" },
      { text: "Share your real-time location with trusted contacts.", icon: MapPin, severity: "high" },
    ],
    Drugs: [
      { text: "Never accept drinks or food from strangers.", icon: Coffee, severity: "high" },
      { text: "Report suspicious activity in neighborhood 'trap houses'.", icon: Home, severity: "medium" },
      { text: "Keep prescription medications locked and secure.", icon: Lock, severity: "medium" },
    ],
    Vandalism: [
      { text: "Install motion-sensor lighting around your property.", icon: Sun, severity: "medium" },
      { text: "Report graffiti immediately to prevent further damage.", icon: Edit3, severity: "low" },
      { text: "Use security cameras to deter property defacement.", icon: Camera, severity: "medium" },
    ],
    Assault: [
      { text: "Stay aware of surroundings at night.", icon: Eye, severity: "high" },
      { text: "Avoid isolated areas when walking alone.", icon: AlertTriangle, severity: "medium" },
      { text: "Take a basic self-defense course for personal safety.", icon: Shield, severity: "medium" },
    ],
    "Domestic Violence": [
      { text: "Keep a packed 'go-bag' in a safe, hidden location.", icon: Briefcase, severity: "high" },
      { text: "Establish a code word with trusted friends or family.", icon: MessageSquare, severity: "high" },
      { text: "Memorize the number for the local domestic violence hotline.", icon: PhoneCall, severity: "high" },
    ],
    Robbery: [
      { text: "Do not resist if the robber is armed; prioritize your life.", icon: AlertCircle, severity: "high" },
      { text: "Carry only the amount of cash you absolutely need.", icon: Wallet, severity: "medium" },
      { text: "Be extra cautious when using ATMs at night.", icon: CreditCard, severity: "high" },
    ],
    Bribery: [
      { text: "Always ask for official receipts for all payments.", icon: Receipt, severity: "medium" },
      { text: "Refuse and report any official asking for 'extra' fees.", icon: XCircle, severity: "high" },
      { text: "Record the details of the official and the time of the request.", icon: Clock, severity: "medium" },
    ],
    Extortion: [
      { text: "Do not pay; this often leads to further demands.", icon: ShieldOff, severity: "high" },
      { text: "Immediately cut off all contact with the extortionist.", icon: PhoneOff, severity: "high" },
      { text: "Report the threat to law enforcement specialized units.", icon: Shield, severity: "high" },
    ],
    Stalking: [
      { text: "Change your daily routes and times of travel.", icon: Map, severity: "high" },
      { text: "Set all social media profiles to strictly private.", icon: EyeOff, severity: "medium" },
      { text: "Notify local police and file for a restraining order.", icon: FileText, severity: "high" },
    ],
    "Human Trafficking": [
      { text: "Be wary of job offers that seem 'too good to be true'.", icon: Briefcase, severity: "high" },
      { text: "Never give your passport to an employer or recruiter.", icon: File, severity: "high" },
      { text: "Learn the signs of trafficking to help identify victims.", icon: Search, severity: "medium" },
    ],
    "Illegal Weapons": [
      { text: "Report sightings of illegal or concealed firearms.", icon: AlertTriangle, severity: "high" },
      { text: "Teach children to never touch a gun and tell an adult.", icon: UserPlus, severity: "high" },
      { text: "Support local 'buy-back' programs to reduce street weapons.", icon: Heart, severity: "low" },
    ],
    Arson: [
      { text: "Clear dry brush and flammable debris from around buildings.", icon: Trash2, severity: "medium" },
      { text: "Report abandoned buildings or piles of trash to the city.", icon: Building, severity: "medium" },
      { text: "Install smoke detectors and test them monthly.", icon: Bell, severity: "high" },
    ],
  };

    const defaultTips = [
      {
        text: "Always lock your doors and windows.",
        icon: Lock,
        severity: "medium",
      },
      {
        text: "Avoid sharing personal info online.",
        icon: Smartphone,
        severity: "high",
      },
      {
        text: "Stay alert in crowded places.",
        icon: Eye,
        severity: "medium",
      },
    ];

    // =========================
    // 🧠 CONTEXT-AWARE MERGE
    // =========================

    const getContextTips = () => {
      const categories = trendingCrimes.map((c) => c.crimeType);

      let contextual = [];

      categories.forEach((cat) => {
        if (tipsByCategory[cat]) {
          contextual.push(...tipsByCategory[cat]);
        }
      });

      // fallback if nothing matches
      return contextual.length > 0 ? contextual : defaultTips;
    };

    const tips = getContextTips();

    // =========================
    // 🔁 ROTATION LOGIC
    // =========================

    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [fade, setFade] = useState(true);

    useEffect(() => {
      if (paused || tips.length === 0) return;

      const interval = setInterval(() => {
        setFade(false); // fade out

        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % tips.length);
          setFade(true); // fade in
        }, 200); // fade duration
      }, 3000);

      return () => clearInterval(interval);
    }, [paused, tips]);

    const currentTip = tips[currentIndex];

    const severityStyles = {
      high: "border-red-500 bg-red-500/10 text-red-600",
      medium: "border-yellow-500 bg-yellow-500/10 text-yellow-600",
      low: "border-blue-500 bg-blue-500/10 text-blue-600",
    };

  return (
    <aside className="w-[300px] hidden lg:block space-y-6">
      
      {/* Trending Crimes */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Trending Crimes
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : trendingCrimes.length === 0 ? (
            <p className="text-sm text-gray-500">No trending crimes</p>
          ) : (
            trendingCrimes.map((crime) => {
              const desc = crime.incidentDescription || "No description";
              const isLong = desc.length > 25;

              return (
                <div
                  key={crime._id}
                  onClick={() => setSelectedPostId(crime._id)}
                  className="px-2 py-1 pb-2 text-sm transition border-b rounded-md cursor-pointer last:border-none hover:bg-muted/40"
                >
                  {/* TITLE */}
                  {isLong ? (
                    <div className="relative overflow-hidden ticker-wrapper">
                      <div className="font-medium ticker-content">
                        <span className="mr-10">{desc}</span>
                        <span>{desc}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium">{desc}</p>
                  )}

                  {/* SUBTITLE */}
                  <p className="text-xs text-gray-500">
                    {crime.crimeType} • {crime.shortLocation}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* SAFETY TIPS */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Safety Tip
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`p-4 rounded-xl border transition-all duration-300 ${severityStyles[currentTip.severity]}`}
          >
            <div
              className={`flex items-start gap-3 transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              <currentTip.icon className="w-5 h-5 mt-1 shrink-0" />

              <p className="text-sm font-medium leading-relaxed">
                {currentTip.text}
              </p>
            </div>
          </div>

          {/* dots indicator */}
          <div className="flex justify-center gap-1 mt-3">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentIndex
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🔥 POST MODAL */}
      {selectedPostId && (
        <PostModal
          selectedPostId={selectedPostId}
          handleClosePost={() => setSelectedPostId(null)}
          post={postData?.data || null}
        />
      )}
    </aside>
  );
};

export default RightSidebar;