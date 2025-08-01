import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
function App() {


  return (
    <>
    <Button>HEllo</Button>
    <Search className="w-6 h-6 text-gray-700" />
     <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 10 }}>
      Hello Reportics
    </motion.h1>
      
    </>
  )
}

export default App


