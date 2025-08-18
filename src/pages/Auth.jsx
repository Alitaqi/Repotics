// pages/Auth.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import sampleVideo from "@/assets/videos/v4.mp4";
import { useRegisterUserMutation, useLoginUserMutation } from "@/lib/redux/api/authApi.js"; 
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/redux/slices/authSlice.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog";
import { User, Mail, Lock, Calendar } from "lucide-react";
import debounce from "lodash.debounce";

export default function Auth() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", dob: "" });
  const [showDobAlert, setShowDobAlert] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const [registerUser] = useRegisterUserMutation();
  const [loginUser] = useLoginUserMutation();

  // Debounced username check
  const checkUsername = debounce(async (username) => {
    if (!username) return setUsernameAvailable(null);
    try {
      const res = await fetch(`http://localhost:5000/api/users/check-username?username=${username}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch (err) {
      console.error(err);
    }
  }, 500);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "username") checkUsername(value);
  };

  const isOldEnough = (dob) => {
    if (!dob) return true;
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 16;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOldEnough(form.dob)) {
      setShowDobAlert(true);
      return;
    }

    try {
      if (isLogin) {
        const user = await loginUser({ credential: form.email, password: form.password }).unwrap();
        dispatch(setUser(user));
      } else {
        const user = await registerUser(form).unwrap();
        dispatch(setUser(user));
      }
      alert("Success!");
    } catch (err) {
      console.error(err);
      alert(err.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Video */}
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <video
        src={sampleVideo}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          zIndex: -1, // ensures video stays in the background
        }}
      />
      
      {/* Overlay & Form */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md p-8 border shadow-lg rounded-2xl bg-white/10 backdrop-blur-lg border-white/20"
        >
          <h2 className="mb-6 text-3xl font-bold text-center text-white">
            {isLogin ? "Login" : "Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <Label className="text-white">Name</Label>
                  <Input
                    name="name"
                    placeholder="Ali Taqi"
                    value={form.name}
                    onChange={handleChange}
                    className="pl-10 text-white placeholder-white/70"
                  />
                  <User className="absolute left-3 top-12 text-white/70" />
                </div>

                <div className="relative">
                  <Label className="text-white">Username</Label>
                  <Input
                    name="username"
                    placeholder="alitaqi349"
                    value={form.username}
                    onChange={handleChange}
                    className="pl-10 text-white placeholder-white/70"
                  />
                  <User className="absolute left-3 top-12 text-white/70" />
                  {usernameAvailable !== null && (
                    <p className={`mt-1 text-sm ${usernameAvailable ? "text-green-400" : "text-red-400"}`}>
                      {usernameAvailable ? "Username available" : "Username taken"}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Label className="text-white">Date of Birth</Label>
                  <Input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="pl-10 text-white placeholder-white/70"
                  />
                  <Calendar className="absolute left-3 top-12 text-white/70" />
                </div>
              </>
            )}

            <div className="relative">
              <Label className="text-white">Email {isLogin ? "" : "/ Username"}</Label>
              <Input
                name="email"
                placeholder="example@mail.com"
                value={form.email}
                onChange={handleChange}
                className="pl-10 text-white placeholder-white/70"
              />
              <Mail className="absolute left-3 top-12 text-white/70" />
            </div>

            <div className="relative">
              <Label className="text-white">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="pl-10 text-white placeholder-white/70"
              />
              <Lock className="absolute left-3 top-12 text-white/70" />
            </div>

            <Button type="submit" className="w-full mt-4">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>

          <p className="mt-4 text-center text-white/80">
            {isLogin ? "No account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </motion.div>
      </div>
      </div>

      {/* DOB Alert Dialog */}
      <AlertDialog open={showDobAlert} onOpenChange={setShowDobAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Parental Alert</AlertDialogTitle>
            <AlertDialogDescription>
              You must be at least 16 years old to sign up. This website contains sensitive material. Please have parental supervision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowDobAlert(false)}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    
  );
}
