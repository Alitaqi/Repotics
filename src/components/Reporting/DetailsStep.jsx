import React, { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDraft } from "@/lib/redux/slices/reportSlice";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 flex items-center rounded-full transition ${
        checked ? "bg-[#1B4FCE]" : "bg-gray-300"
      }`}
    >
      <span
        className={`h-5 w-5 bg-white rounded-full transform transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function DetailsStep() {
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.report.draft);

  // --- Crime dropdown ---
  const crimeTypes = [
    "Theft", "Murder", "Harassment", "Fraud", "Cybercrime",
    "Kidnapping", "Drugs", "Vandalism", "Assault", "Domestic Violence",
    "Robbery", "Bribery", "Extortion", "Stalking", "Human Trafficking",
    "Illegal Weapons", "Arson", "Other"
  ];

  const [crimeOpen, setCrimeOpen] = useState(false);
  const [crimeSearch, setCrimeSearch] = useState("");

  const filteredCrimes = useMemo(() => {
    return crimeTypes.filter((c) =>
      c.toLowerCase().includes(crimeSearch.toLowerCase())
    );
  }, [crimeSearch]);

  // --- Location dropdown (API) ---
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!locationSearch) {
      setSuggestions([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search? +
            q${encodeURIComponent(locationSearch + " Pakistan")}&format=json&limit=5`,
          {
            headers: {
              "Accept": "application/json",
              "User-Agent": "reportics/1.0 (contact: ali@gmail.com)" // replace with your email
            }
          }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Location search error:", err);
      }
    };

    const debounce = setTimeout(fetchLocations, 400);
    return () => clearTimeout(debounce);
  }, [locationSearch]);

  // --- Reverse geocode for "Use My Location" ---
  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: { "User-Agent": "reportics/1.0 (contact: ali@gmail.com)" }
            }
          );
          const data = await res.json();
          dispatch(
            updateDraft({
              locationText: data.display_name,
              coordinates: { lat: latitude, lng: longitude },
            })
          );
          setLocationSearch(data.display_name);
        } catch (err) {
          console.error("Reverse geocode failed:", err);
        }
      },
      (err) => alert("Location error: " + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- Click outside & Escape to close dropdowns ---
  const wrapperRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setCrimeOpen(false);
        setLocationOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setCrimeOpen(false);
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="space-y-6">
      {/* Section Heading */}
      <div className="px-4 py-2 text-white bg-black rounded-lg shadow">
        <h2 className="text-lg font-semibold">Incident Details</h2>
        <p className="text-sm opacity-90">Please provide details of the crime below.</p>
      </div>

      {/* Crime Type Dropdown */}
      <div className="relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Crime Type
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search or select crime..."
            value={crimeSearch || draft.crimeType}
            onChange={(e) => {
              setCrimeSearch(e.target.value);
              setCrimeOpen(true);
            }}
            onFocus={() => setCrimeOpen(true)}
            className="w-full border rounded-lg p-2 pr-8 focus:ring-2 focus:ring-[#1B4FC0E] focus:outline-none"
          />
          <ChevronDown
            onClick={() => setCrimeOpen((prev) => !prev)}
            className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 cursor-pointer right-2 top-1/2"
          />
        </div>
        {crimeOpen && (
          <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-md max-h-40">
            {filteredCrimes.map((c) => (
              <div
                key={c}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                  draft.crimeType === c ? "bg-blue-100 font-medium" : ""
                }`}
                onClick={() => {
                  dispatch(updateDraft({ crimeType: c }));
                  setCrimeSearch(c);
                  setCrimeOpen(false);
                }}
              >
                {c}
              </div>
            ))}
            {filteredCrimes.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No results</div>
            )}
          </div>
        )}
      </div>

      {/* Date / Time */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="date"
          value={draft.date}
          onChange={(e) => dispatch(updateDraft({ date: e.target.value }))}
          className="border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-[#1B4FCE] focus:outline-none"
        />
        <input
          type="time"
          value={draft.time}
          onChange={(e) => dispatch(updateDraft({ time: e.target.value }))}
          className="border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-[#1B4FCE] focus:outline-none"
        />
      </div>

      {/* Location Dropdown */}
      <div className="relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Location
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search location..."
            value={locationSearch || draft.locationText}
            onChange={(e) => {
              setLocationSearch(e.target.value);
              setLocationOpen(true);
            }}
            onFocus={() => setLocationOpen(true)}
            className="w-full border rounded-lg p-2 pr-8 focus:ring-2 focus:ring-[#1B4FCE] focus:outline-none"
          />
          <ChevronDown
            onClick={() => setLocationOpen((prev) => !prev)}
            className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 cursor-pointer right-2 top-1/2"
          />
        </div>
        {locationOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-md max-h-40">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                  draft.locationText === s.display_name ? "bg-blue-100 font-medium" : ""
                }`}
                onClick={() => {
                  dispatch(
                    updateDraft({
                      locationText: s.display_name,
                      coordinates: { lat: s.lat, lng: s.lon },
                    })
                  );
                  setLocationSearch(s.display_name);
                  setLocationOpen(false);
                }}
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={useMyLocation}
          className="mt-2 bg-black hover:bg-[#163da0] text-white"
        >
          Use my location
        </Button>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
        <span>Post as Anonymous</span>
        <Toggle
          checked={draft.anonymous}
          onChange={(v) => dispatch(updateDraft({ anonymous: v }))}
        />
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.agreed}
          onChange={(e) => dispatch(updateDraft({ agreed: e.target.checked }))}
          className="mt-0.5"
        />
        <span>
          I confirm this report is accurate. False reports may have legal
          consequences.
        </span>
      </label>
    </div>
  );
}