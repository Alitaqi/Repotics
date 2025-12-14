import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Shield, X, Filter, Clock, Target, User, MessageCircle, Image } from "lucide-react";
import { useGetHeatmapDataQuery } from "@/lib/redux/api/heatmapApi";
import { useGetPostByIdQuery } from "@/lib/redux/api/reportApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostModal from "@/components/layout/PostModal";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const CRIME_TYPES = [
  "Theft", "Murder", "Harassment", "Fraud", "Cybercrime", "Kidnapping", "Drugs",
  "Vandalism", "Assault", "Domestic Violence", "Robbery", "Bribery", "Extortion",
  "Stalking", "Human Trafficking", "Illegal Weapons", "Arson", "Other"
];

const TIME_FILTERS = {
  "24h": "Last 24 Hours",
  "week": "Last Week",
  "month": "Last Month",
  "3months": "Last 3 Months"
};

function SimplePostView({ post }) {
  if (!post) return <div className="p-4 text-gray-500">Loading post details...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold">{post.user?.name || 'Anonymous'}</h3>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()} • {post.crimeType}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      <p className="text-sm">{post.description}</p>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.hashtags.map((tag, i) => (
            <span key={i} className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {post.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Post image ${i + 1}`}
              className="object-cover w-full h-48 rounded-lg"
            />
          ))}
          {post.images.length > 3 && (
            <p className="text-sm text-gray-500">+{post.images.length - 3} more images</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{(post.upvotes?.length || 0) - (post.downvotes?.length || 0)} votes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* Simple Comments Preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="flex items-center gap-1 font-medium">
            <MessageCircle className="w-4 h-4" /> Comments
          </h4>
          {post.comments.slice(0, 3).map((comment, i) => (
            <div key={i} className="p-2 rounded-lg bg-gray-50">
              <p className="text-sm font-medium">{comment.user?.name || 'User'}</p>
              <p className="text-xs">{comment.text}</p>
            </div>
          ))}
          {post.comments.length > 3 && (
            <Button variant="link" className="h-auto p-0 text-xs">View all comments</Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HeatmapPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // UI State (what the user sees in the form)
  const [uiCity, setUiCity] = useState("");
  const [uiCrimeType, setUiCrimeType] = useState("");
  const [uiStartDate, setUiStartDate] = useState("");
  const [uiEndDate, setUiEndDate] = useState("");
  
  // Applied State (what's actually being used for the query)
  const [appliedFilters, setAppliedFilters] = useState({
    city: "",
    type: "",
    startDate: "",
    endDate: ""
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState("3months");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getDateRange = (filterType) => {
    const end = new Date();
    const start = new Date();
   
    switch (filterType) {
      case "24h": start.setDate(start.getDate() - 1); break;
      case "week": start.setDate(start.getDate() - 7); break;
      case "month": start.setMonth(start.getMonth() - 1); break;
      case "3months": start.setMonth(start.getMonth() - 3); break;
      case "custom": return { startDate: uiStartDate || "", endDate: uiEndDate || "" };
      default: start.setMonth(start.getMonth() - 3);
    }
   
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0]
    };
  };

  const handleTimeFilter = (filterType) => {
    setActiveTimeFilter(filterType);
    setHasUnsavedChanges(true);
   
    if (filterType !== "custom") {
      const { startDate: newStartDate, endDate: newEndDate } = getDateRange(filterType);
      setUiStartDate(newStartDate);
      setUiEndDate(newEndDate);
    }
  };

  useEffect(() => {
    if (!uiStartDate && !uiEndDate) {
      const { startDate: initialStart, endDate: initialEnd } = getDateRange("3months");
      setUiStartDate(initialStart);
      setUiEndDate(initialEnd);
      // Set initial applied filters
      setAppliedFilters({
        city: "",
        type: "",
        startDate: initialStart,
        endDate: initialEnd
      });
    }
  }, []);

  // Use appliedFilters for the query, not the UI state
  const { data, isFetching, refetch } = useGetHeatmapDataQuery(appliedFilters, { skip: false });

  // eslint-disable-next-line no-unused-vars
  const { data: selectedPost, isLoading: postLoading } = useGetPostByIdQuery(selectedPostId, { 
    skip: !selectedPostId 
  });

  // Check for unsaved changes
  useEffect(() => {
    const currentUiFilters = {
      city: uiCity,
      type: uiCrimeType,
      startDate: uiStartDate,
      endDate: uiEndDate
    };
    
    const hasChanges = 
      currentUiFilters.city !== appliedFilters.city ||
      currentUiFilters.type !== appliedFilters.type ||
      currentUiFilters.startDate !== appliedFilters.startDate ||
      currentUiFilters.endDate !== appliedFilters.endDate;
    
    setHasUnsavedChanges(hasChanges);
  }, [uiCity, uiCrimeType, uiStartDate, uiEndDate, appliedFilters]);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const initializeMap = () => {
      try {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [73.0479, 33.6844],
          zoom: 10,
          attributionControl: false
        });

        mapRef.current = map;

        map.on('load', () => {
          setMapInitialized(true);
          
          // Force resize after a small delay to ensure container is properly sized
          setTimeout(() => {
            map.resize();
          }, 100);
        });

        // Legend
        const legend = document.createElement("div");
        legend.className =
          "absolute z-40 p-4 text-sm font-medium text-white border shadow-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm sm:block bottom-6 left-6 rounded-2xl border-gray-700/50";
        legend.innerHTML = `
          <div class="flex items-center gap-2 mb-3">
            <div class="p-1.5 bg-red-500 rounded-full"></div>
            <span class="text-white font-semibold">Crime Intensity</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="flex items-center gap-2"><span style="background:#ffffb2;width:20px;height:4px;border-radius:2px;"></span> Low</span>
            <span class="flex items-center gap-2"><span style="background:#fd8d3c;width:20px;height:6px;border-radius:3px;"></span> Medium</span>
            <span class="flex items-center gap-2"><span style="background:#bd0026;width:20px;height:8px;border-radius:4px;"></span> High</span>
          </div>
        `;
        map.getContainer().appendChild(legend);

        // Reset button
        const resetBtn = document.createElement("button");
        resetBtn.innerText = "Reset View";
        resetBtn.className =
          "absolute z-40 hidden px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 sm:block bottom-6 right-6 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-500/30";
        resetBtn.onclick = () => map.flyTo({ center: [73.0479, 33.6844], zoom: 10 });
        map.getContainer().appendChild(resetBtn);

        // Handle resize events
        const handleResize = () => {
          if (map) {
            setTimeout(() => map.resize(), 150);
          }
        };
        
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Small delay to ensure DOM is ready, especially on mobile
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update heatmap layers
  useEffect(() => {
    if (!data || !mapRef.current || !mapInitialized) return;

    const map = mapRef.current;

    const setupLayers = () => {
      // Remove existing layers
      ["crime-heatmap", "clusters", "cluster-count", "crime-point"].forEach((id) =>
        map.getLayer(id) && map.removeLayer(id)
      );
      if (map.getSource("crimes")) map.removeSource("crimes");

      map.addSource("crimes", {
        type: "geojson",
        data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "crime-heatmap",
        type: "heatmap",
        source: "crimes",
        maxzoom: 15,
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": { stops: [[10, 1], [15, 2]] },
          "heatmap-radius": { stops: [[0, 5], [9, 20], [12, 30], [15, 40]] },
          "heatmap-opacity": { default: 1, stops: [[7, 1], [15, 0]] },
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.1,
            "#ffffb2",
            0.3,
            "#fecc5c",
            0.5,
            "#fd8d3c",
            0.7,
            "#f03b20",
            1,
            "#bd0026",
          ],
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "crimes",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#ffeb3b", 10, "#ff9800", 30, "#e53935"],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "crimes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        },
        paint: { "text-color": "#000" },
      });

      map.addLayer({
        id: "crime-point",
        type: "circle",
        source: "crimes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#ff3d00",
          "circle-radius": 5,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff"
        },
      });

      // Click event for individual crime points
      map.on('click', 'crime-point', (e) => {
        const features = e.features;
        if (features && features.length > 0) {
          const postId = features[0].properties._id || features[0].properties.id || features[0].properties.postId;
          if (postId) {
            setSelectedPostId(postId);
            // Optional: Zoom/fly to the clicked point
            map.flyTo({
              center: e.lngLat,
              zoom: 14
            });
          } else {
            console.warn('No post ID found in feature properties', features[0].properties);
          }
        }
      });

      // Change cursor to pointer on hover over crime points
      map.on('mouseenter', 'crime-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'crime-point', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once("load", setupLayers);
    }
  }, [data, mapInitialized]);

  // Resize map when sidebar opens/closes or when map initializes
  useEffect(() => {
    if (mapRef.current && mapInitialized) {
      // Use timeout to ensure the DOM has updated
      setTimeout(() => {
        mapRef.current.resize();
      }, 300);
    }
  }, [sidebarOpen, mapInitialized]);

  // Additional resize on mobile orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      if (mapRef.current) {
        setTimeout(() => mapRef.current.resize(), 200);
      }
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    // Apply the UI filters to the actual query
    setAppliedFilters({
      city: uiCity,
      type: uiCrimeType,
      startDate: uiStartDate,
      endDate: uiEndDate
    });
    // Refetch with new filters
    refetch();
    setHasUnsavedChanges(false);
  };

  const clearFilters = () => {
    setUiCity("");
    setUiCrimeType("");
    setActiveTimeFilter("3months");
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRange("3months");
    setUiStartDate(defaultStart);
    setUiEndDate(defaultEnd);
    setHasUnsavedChanges(true);
  };

  const handleClosePost = () => {
    setSelectedPostId(null);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 lg:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:h-screen lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Card className="h-full overflow-hidden border-none shadow-none">
          <CardContent className="flex flex-col h-full p-0">
            <div className="sticky top-0 z-10 p-6 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">Crime Filters</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-red-50" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-red-500" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">Refine your heatmap view</p>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Unsaved filter changes
                </div>
              )}
            </div>

            {/* Time Filter Buttons */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4" />
                Time Range
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {Object.entries(TIME_FILTERS).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={activeTimeFilter === key ? "default" : "outline"}
                    size="sm"
                    className={`text-xs sm:text-sm rounded-full px-3 py-1.5 font-medium transition-all duration-200 ${
                      activeTimeFilter === key
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTimeFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={handleApplyFilters} className="flex flex-col flex-1 gap-0 p-6 overflow-y-auto">
              <div className="mb-6 space-y-1">
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-red-500" />
                  City
                </label>
                <Input
                  placeholder="e.g. Islamabad"
                  value={uiCity}
                  onChange={(e) => {
                    setUiCity(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-xl"
                />
              </div>

              <div className="mb-6 space-y-1">
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Crime Type
                </label>
                <Select 
                  value={uiCrimeType} 
                  onValueChange={(value) => {
                    setUiCrimeType(value);
                    setHasUnsavedChanges(true);
                  }}
                >
                  <SelectTrigger className="w-full h-12 px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Crime Types" />
                  </SelectTrigger>
                  <SelectContent className="overflow-y-auto max-h-48">
                    {CRIME_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-8 space-y-1">
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Date Range
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="date"
                      value={uiStartDate}
                      onChange={(e) => {
                        setUiStartDate(e.target.value);
                        setActiveTimeFilter("custom");
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full pl-10 bg-white border-gray-200 focus:border-green-500 focus:ring-green-200 rounded-xl"
                    />
                    <Calendar className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
                  </div>
                  <div className="relative">
                    <Input
                      type="date"
                      value={uiEndDate}
                      onChange={(e) => {
                        setUiEndDate(e.target.value);
                        setActiveTimeFilter("custom");
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full pl-10 bg-white border-gray-200 focus:border-green-500 focus:ring-green-200 rounded-xl"
                    />
                    <Calendar className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 flex gap-3 py-4 pt-2 bg-white border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-medium px-6 py-2.5 transition-all duration-200"
                  onClick={clearFilters}
                  disabled={isFetching}
                >
                  Clear All
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 bg-gradient-to-r font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 ${
                    hasUnsavedChanges 
                      ? "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white" 
                      : "from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 cursor-not-allowed"
                  }`}
                  disabled={isFetching || !hasUnsavedChanges}
                >
                  {isFetching ? "Applying..." : "Apply Filters"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <div className="flex-1 ml-4 relative max-h-[90vh] min-h-[80vh] lg:min-h-[85vh] rounded-2xl overflow-hidden border border-gray-200 bg-gray-900">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {/* Mobile filter button */}
        <Button
          className="absolute z-50 p-3.5 text-white bg-gradient-to-br from-blue-600 to-blue-700 rounded-full lg:hidden top-6 right-6 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
          size="sm"
        >
          <Filter className="w-5 h-5" />
          {hasUnsavedChanges && (
            <span className="absolute w-3 h-3 bg-red-500 rounded-full -top-1 -right-1 animate-pulse"></span>
          )}
        </Button>

        {/* Loading indicator */}
        {!mapInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-lg font-medium text-white">
              <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
              Loading map...
            </div>
          </div>
        )}
      </div>

      <PostModal
        post={selectedPost}
        selectedPostId={selectedPostId}
        handleClosePost={handleClosePost}
        />
    </div>
  );
}