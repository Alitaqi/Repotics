import React from "react";
import { Button } from "@/components/ui/button";

const Feed = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md p-6 space-y-6 bg-white shadow-md rounded-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Reportics Feed
        </h1>
        <p className="text-center text-gray-500">
          Choose an option below to report
        </p>

        <div className="flex flex-col space-y-4">
          <Button className="w-full" variant="default">
            Report a Crime
          </Button>
          <Button className="w-full" variant="secondary">
            Report a Missing Person
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
