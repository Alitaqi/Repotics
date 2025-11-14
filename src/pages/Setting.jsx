// pages/Settings.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2, Eye, EyeOff, MapPin } from "lucide-react";
import Map from "react-map-gl";
import { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  useUpdateProfilePictureMutation,
  useUpdateBannerPictureMutation,
  useUpdateBioMutation,
  useUpdateNameMutation,
  useUpdateLocationMutation,
  useUpdatePasswordMutation,
} from "@/lib/redux/api/profileApi";
import {
  replaceProfileImage,
  replaceBannerImage,
  setBio,
  setProfile,
} from "@/lib/redux/slices/profileSlice";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const profileImage = user?.profilePicture || "/default-avatar.png";
  const bannerImage = user?.bannerPicture || "/default-banner.jpg";

  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // States synced with backend user
  const [name, setName] = useState(user?.name || "");
  const [bio, setBioInput] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Location states
  const [location, setLocation] = useState(user?.location || "");
  const [coords, setCoords] = useState(
    user?.location?.coordinates || { lat: 33.6844, lng: 73.0479 } // default Islamabad
  );

  // keep fields synced if user changes after load
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLocation(user.location || "");
      setCoords(user.location?.coordinates || { lat: 33.6844, lng: 73.0479 });
      setBioInput(user.bio || "");
    }
  }, [user]);

  const [updateProfilePicture, { isLoading: isUpdatingProfile }] =
    useUpdateProfilePictureMutation();
  const [updateBannerPicture, { isLoading: isUpdatingBanner }] =
    useUpdateBannerPictureMutation();
  const [updateBio, { isLoading: isUpdatingBio }] = useUpdateBioMutation();
  const [updateName, { isLoading: isUpdatingName }] = useUpdateNameMutation();
  const [updateLocation, { isLoading: isUpdatingLocation }] =
    useUpdateLocationMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] =
    useUpdatePasswordMutation();

  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);

    const reader = new FileReader();
    reader.onload = (event) =>
      dispatch(replaceProfileImage(event.target.result));
    reader.readAsDataURL(file);

    try {
      const res = await updateProfilePicture(formData).unwrap();
      if (res.user?.profilePicture) {
        dispatch(replaceProfileImage(res.user.profilePicture));
      }
    } catch (err) {
      console.error("Profile upload failed", err);
    }
  };

const [isLocating, setIsLocating] = useState(false);
const [locError, setLocError] = useState(null);

const useMyLocation = () => {
  if (!navigator.geolocation) {
    setLocError("Geolocation is not supported by your browser.");
    return;
  }

  setIsLocating(true);
  setLocError(null);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        await reverseGeocode(longitude, latitude);
        setCoords({ lat: latitude, lng: longitude });
      } catch (err) {
        console.error("Reverse geocode failed:", err);
        setLocError("Failed to fetch your location. Please try again.");
      } finally {
        setIsLocating(false);
      }
    },
    (err) => {
      console.error("Location error:", err);
      setLocError(
        err.code === err.PERMISSION_DENIED
          ? "Location access denied. Please enable it in your browser."
          : "Unable to fetch location. Try again."
      );
      setIsLocating(false);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
};
    const reverseGeocode = async (longitude, latitude) => {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    if (!data?.features?.length) return;

    const place = data.features[0];
    const fullLocation = place.place_name || "Unknown Location";
    setLocation(fullLocation);
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    setLocation("Unknown Location");
  }
};




  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("bannerPicture", file);

    const reader = new FileReader();
    reader.onload = (event) =>
      dispatch(replaceBannerImage(event.target.result));
    reader.readAsDataURL(file);

    try {
      const res = await updateBannerPicture(formData).unwrap();
      if (res.user?.bannerPicture) {
        dispatch(replaceBannerImage(res.user.bannerPicture));
      }
    } catch (err) {
      console.error("Banner upload failed", err);
    }
  };

  const saveName = async () => {
    if (name === user?.name) return;
    await updateName({ name }).unwrap();
    dispatch(setProfile({ ...user, name }));
  };

  const saveLocation = async () => {
    await updateLocation({
    location,
    coordinates: coords,
  }).unwrap();
  dispatch(setProfile({ ...user, location, coordinates: coords }));
  };

  const saveBio = async () => {
    if (bio === user?.bio) return;
    await updateBio( bio ).unwrap();
    dispatch(setBio(bio));
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) return;
    await updatePassword({ currentPassword, newPassword }).unwrap();
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="max-w-3xl p-4 mx-auto space-y-6">
      {/* Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-48 overflow-hidden bg-gray-200 rounded-lg">
            <img
              src={bannerImage}
              alt="Banner"
              className="object-cover w-full h-full"
            />
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUpdatingBanner}
            >
              {isUpdatingBanner ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profileImage} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <input
            type="file"
            ref={profileInputRef}
            onChange={handleProfileUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={() => profileInputRef.current?.click()}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Change"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <div className="flex gap-2 mt-1">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Button onClick={saveName} disabled={isUpdatingName}>
                Save
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Username</label>
            <Input value={user?.username} disabled />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={user?.email} disabled />
          </div>

          <div>
            <label className="text-sm font-medium">Date of Birth</label>
            <Input
              value={
                user?.dob
                  ? new Date(user.dob).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
              disabled
            />
          </div>

          {/* Location Section */}
          <div>
            <label className="text-sm font-medium">Location</label>
            <div className="mt-1 space-y-2">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g., F-8, Islamabad)"
              />
              <div className="w-full h-64">
                <Map
                    initialViewState={{
                        longitude: coords.lng,
                        latitude: coords.lat,
                        zoom: 10,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    onClick={(e) => {
                        const lat = e.lngLat.lat;
                        const lng = e.lngLat.lng;
                        setCoords({ lat, lng });
                        reverseGeocode(lng, lat); // updates city + area automatically
                    }}
                    >
                    <Marker longitude={coords.lng} latitude={coords.lat} color="red" />
                    </Map>

              </div>
                {locError && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <MapPin size={14} />
                  {locError}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={useMyLocation}
                  disabled={isLocating}
                  className="text-white bg-black hover:bg-gray-800"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Use My Location
                    </>
                  )}
                </Button>

                <Button onClick={saveLocation} disabled={isUpdatingLocation}>
                  Save Location
                </Button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium">Bio</label>
            <div className="space-y-2">
              <Textarea
                value={bio}
                onChange={(e) => setBioInput(e.target.value)}
              />
              <Button onClick={saveBio} disabled={isUpdatingBio}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute text-gray-500 right-2 top-2"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute text-gray-500 right-2 top-2"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            className="w-full"
            onClick={savePassword}
            disabled={isUpdatingPassword}
          >
            {isUpdatingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">
            Get Verified
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
