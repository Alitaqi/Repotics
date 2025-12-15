// components/Reporting/DetailsStep.jsx
import React, { useState, useMemo, useEffect, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDraft } from "@/lib/redux/slices/reportSlice";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, MapPin, AlertCircle, Check } from "lucide-react";
import { debounce } from "lodash";
import {
  useLazySearchLocationsQuery,
  useLazyReverseGeocodeQuery,
} from "@/lib/redux/api/reportApi";

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

export default function DetailsStep({ onSubmit, isLoading, canSubmit }) {
  const [triggerSearchLocations] = useLazySearchLocationsQuery();
  const [triggerReverseGeocode] = useLazyReverseGeocodeQuery();
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.report.draft);

  // --- Crime dropdown ---
  const crimeTypes = useMemo(
    () => [
      "Theft",
      "Murder",
      "Harassment",
      "Fraud",
      "Cybercrime",
      "Kidnapping",
      "Drugs",
      "Vandalism",
      "Assault",
      "Domestic Violence",
      "Robbery",
      "Bribery",
      "Extortion",
      "Stalking",
      "Human Trafficking",
      "Illegal Weapons",
      "Arson",
      "Other",
    ],
    []
  );

  const [crimeOpen, setCrimeOpen] = useState(false);
  const [crimeSearch, setCrimeSearch] = useState("");

  const filteredCrimes = useMemo(() => {
    return crimeTypes.filter((c) =>
      c.toLowerCase().includes(crimeSearch.toLowerCase())
    );
  }, [crimeSearch, crimeTypes]);

  // --- Location dropdown (API) ---
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Location search (debounced)
  const fetchLocations = useMemo(
    () =>
      debounce(async (search) => {
        if (!search.trim()) {
          setSuggestions([]);
          setError(null);
          return;
        }
        setIsLocationLoading(true);
        setError(null);

        try {
          const data = await triggerSearchLocations(search).unwrap();
          setSuggestions(data);
        } catch (err) {
          console.error("Location search error:", err);
          setError("Failed to fetch locations. Please try again.");
          setSuggestions([]);
        } finally {
          setIsLocationLoading(false);
        }
      }, 500),
    [triggerSearchLocations]
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const data = await triggerReverseGeocode({ lat: latitude, lon: longitude }).unwrap();

          dispatch(
            updateDraft({
              locationText: data.display_name,
              coordinates: { lat: latitude, lng: longitude },
            })
          );
          setLocationSearch(data.display_name);
          setError(null);
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          setError("Failed to fetch location information. Please try again.");
        } finally {
          setIsLocationLoading(false);
        }
      },
      (err) => {
        console.error("Location error:", err);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please enable location permissions in your browser."
            : "Location unavailable. Please try again."
        );
        setIsLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleLocationChange = (e) => {
    setLocationSearch(e.target.value);
    if (e.target.value.length > 2) {
      fetchLocations(e.target.value);
    } else {
      setSuggestions([]);
      setError(null);
    }
  };

  const handleLocationSelect = (location) => {
    dispatch(
      updateDraft({
        locationText: location.display_name,
        coordinates: { lat: location.lat, lng: location.lon },
      })
    );
    setLocationSearch(location.display_name);
    setSuggestions([]);
    setLocationOpen(false);
    setError(null);
  };

  // Cancel debounce on unmount
  useEffect(() => {
    return () => fetchLocations.cancel();
  }, [fetchLocations]);

  // Click outside & Escape to close dropdowns
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
            value={crimeSearch || draft.crimeType || ""}
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
          value={draft.date || ""}
          onChange={(e) => dispatch(updateDraft({ date: e.target.value }))}
          className="border rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-[#1B4FCE] focus:outline-none"
        />
        <input
          type="time"
          value={draft.time || ""}
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
            value={locationSearch || draft.locationText || ""}
            onChange={handleLocationChange}
            onFocus={() => setLocationOpen(true)}
            className="w-full border rounded-lg p-2 pr-8 focus:ring-2 focus:ring-[#1B4FCE] focus:outline-none"
          />
          <ChevronDown
            onClick={() => setLocationOpen((prev) => !prev)}
            className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 cursor-pointer right-2 top-1/2"
          />
        </div>
        
        {isLocationLoading && (
          <div className="absolute flex items-center mt-1 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Searching...
          </div>
        )}
        
        {error && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
        
        {locationOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-md max-h-40">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                  draft.locationText === s.display_name ? "bg-blue-100 font-medium" : ""
                }`}
                onClick={() => handleLocationSelect(s)}
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}
        
        <Button
          onClick={useMyLocation}
          disabled={isLocationLoading}
          className="mt-2 text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocationLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          Use my location
        </Button>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
        <span>Post as Anonymous</span>
        <Toggle
          checked={draft.anonymous || false}
          onChange={(v) => dispatch(updateDraft({ anonymous: v }))}
        />
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.agreed || false}
          onChange={(e) => dispatch(updateDraft({ agreed: e.target.checked }))}
          className="mt-0.5"
        />
        <span>
          I confirm this report is accurate. False reports may have legal
          consequences.
        </span>
      </label>

      {/* SUBMIT BUTTON - ADDED HERE */}
      <div className="pt-4 border-t">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          className="w-full py-3 text-base font-semibold text-white transition bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting Report...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Submit Report
            </>
          )}
        </Button>
        <p className="mt-2 text-xs text-center text-gray-500">
          Your report will be submitted and you can preview it
        </p>
      </div>
    </div>
  );
}