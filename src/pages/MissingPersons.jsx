import Masonry from "react-masonry-css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedPerson } from "@/lib/redux/slices/missingPersonViewSlice";
import { useGetMissingPersonsQuery } from "@/lib/redux/api/missingPersonsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import MissingPersonModal from "@/components/layout/MissingPersonModal";
import { openModal } from "@/lib/redux/slices/missingPersonSlice";

export default function MissingPersons() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Fetch data from backend
  const { 
    data: persons = [], 
    isLoading, 
    isError, 
    error 
  } = useGetMissingPersonsQuery();

  const handleReportMissingPerson = () => {
    dispatch(openModal());
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl p-6 mx-auto">
        <div className="flex flex-col gap-6">
          {/* Report Button Card Skeleton */}
          <Skeleton className="w-full h-32 rounded-xl" />
          
          <h1 className="mb-6 text-2xl font-bold">Missing Persons</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="w-full h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl p-6 mx-auto">
        <div className="flex flex-col gap-6">
          {/* Report Button Card */}
          <Card className="mb-2">
            <CardContent className="p-6">
              <CardTitle className="mb-4 text-center">Help Find Missing Persons</CardTitle>
              <div className="flex justify-center">
                <Button 
                  className="px-8 py-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleReportMissingPerson}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Report Missing Person
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <h1 className="mb-6 text-2xl font-bold">Missing Persons</h1>
          <div className="p-4 text-red-700 bg-red-100 rounded-lg">
            Error loading missing persons: {error?.message || 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-6 mx-auto">
      {/* Report Missing Person Button Card - Positioned at top middle */}
      <div className="flex justify-center mb-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <CardTitle className="mb-4 text-center text-gray-800">
              Help Find Missing Persons
            </CardTitle>
            <p className="mb-6 text-center text-gray-600">
              If you have information about a missing person, please report it to help bring them home.
            </p>
            <div className="flex justify-center">
              <Button 
                className="px-8 py-6 text-lg font-semibold text-white transition-all duration-200 bg-blue-600 hover:bg-blue-700 hover:scale-105"
                onClick={handleReportMissingPerson}
              >
                <Search className="w-5 h-5 mr-2" />
                Report Missing Person
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-800">Missing Persons</h1>

      {persons.length === 0 ? (
        <div className="text-center">
          <p className="mb-4 text-gray-500">No missing person reports yet.</p>
          <p className="text-gray-400">Be the first to report a missing person.</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-4"
          columnClassName="bg-clip-padding"
        >
          {persons.map((p) => (
            <div
              key={p._id || p.id}
              className="relative mb-4 cursor-pointer group"
              onClick={() => {
                dispatch(setSelectedPerson(p));
                navigate(`/missingperson/${p._id || p.id}`);
              }}
            >
              <img
                src={p.image || p.photos?.[0]?.cropped || "/placeholder.png"}
                alt={p.name}
                className="w-full rounded-xl shadow-md transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/70">
                {p.name}, {p.age}
              </div>
            </div>
          ))}
        </Masonry>
      )}

      {/* Missing Person Modal */}
      <MissingPersonModal />
    </div>
  );
}