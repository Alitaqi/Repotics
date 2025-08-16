import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PlusCircle, Send, Loader2 } from "lucide-react";

export default function CrimeReportingPage() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      setLoading(false);
      setMessage("");
      setFiles([]);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-[#0B0F1B] via-[#111827] to-[#0B0F1B] text-white">
      
      {/* AI Assistant Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl mb-6"
      >
        <Card className="border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
          <CardHeader className="text-xl font-semibold text-center">
            👁️ AI Assistant is analyzing your report...
          </CardHeader>
          <CardContent className="text-sm text-center text-white/80">
            Provide context below — I’ll guide you while you type and attach evidence.
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid w-full max-w-3xl grid-cols-2 gap-4 mb-6 md:grid-cols-3"
        >
          {files.map((file, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="relative p-2 text-xs text-center border shadow-md bg-white/10 backdrop-blur-md border-white/20 rounded-xl"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="object-cover w-full h-32 rounded-lg"
                />
              ) : (
                <p className="truncate">{file.name}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Input + Upload + Send */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center w-full max-w-3xl gap-3 p-4 border shadow-xl bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl"
      >
        {/* Context Input */}
        <Input
          type="text"
          placeholder="Describe the crime briefly..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 text-white bg-transparent border-none placeholder-white/70 focus-visible:ring-0 focus:outline-none"
        />

        {/* File Upload */}
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <PlusCircle className="w-6 h-6 transition text-white/80 hover:text-white" />
        </label>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center w-10 h-10 transition bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </Button>
      </motion.form>
    </div>
  );
}
