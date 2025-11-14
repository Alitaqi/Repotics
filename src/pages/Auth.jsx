// pages/Auth.jsx
import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRegisterUserMutation, useLoginUserMutation } from "@/lib/redux/api/authApi.js";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/redux/slices/authSlice.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog";
import debounce from "lodash.debounce";
import Logo from "@/assets/Logo.svg"; // Assuming you have a logo image

export default function Auth() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "username") checkUsername(value);
  };

  const isOldEnough = (dob) => {
    if (!dob) return true;
    const birthDate = new Date(dob);
     const today = new Date();
     
     let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // if birthday hasn’t happened yet this year, subtract one
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  };
    return age >= 16;
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOldEnough(form.dob)) {
      setShowDobAlert(true);
      return;
    }

    try {
      let user;
      if (isLogin) {
        user = await loginUser({ credential: form.email, password: form.password }).unwrap();
        dispatch(setUser(user));
      } else {
        user = await registerUser(form).unwrap();
      }
      dispatch(setUser(user)); // save user in Redux
      navigate("/feed");  // redirect after both login and signup
      alert("Success!");
    } catch (err) {
      console.error(err);
      alert(err.data?.message || "Something went wrong");
    }
  };

  

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
      <video
        src="https://res.cloudinary.com/dd7mk4do3/video/upload/v1755585083/loginbackgroun_ydkfvk.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[5px]" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md p-8 mx-4 bg-white shadow-xl rounded-2xl sm:mx-0"
        >
          {/* Logo Circle */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full w-14 h-14" >
              <img src={Logo} alt="Logo" className="object-cover w-full h-full rounded-full" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
            {isLogin ? "Log in" : "Sign up"}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name" className="mb-2 text-gray-700">Name</Label>
                  <Input
                    id="name"
                    name="name"
                  placeholder="Ali Taqi"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="mb-2 text-gray-700 ">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="alitaqi349"
                    value={form.username}
                    onChange={handleChange}
                  />
                  {usernameAvailable !== null && (
                    <p className={`mt-1 text-sm ${usernameAvailable ? "text-green-500" : "text-red-500"}`}>
                      {usernameAvailable ? "Username available" : "Username taken"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dob" className="mb-2 text-gray-700">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    placeholder="YYYY-MM-DD"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="mb-2 text-gray-700">
                {isLogin ? "Email / Username" : "Email"}
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="example@mail.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 text-gray-700">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full mt-4 bg-[#1B4FCE] hover:bg-[#1B4FCE]/95">
              {isLogin ? "Log in" : "Sign up"}
            </Button>
          </form>

          {/* Switch login/signup */}
          <p className="mt-4 text-sm text-center text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
             onClick={() => {
              setIsLogin(!isLogin);
              setForm({ name: "", username: "", email: "", password: "", dob: "" }); // reset fields
              setUsernameAvailable(null); // optional: clear username availability check
  }}
              className="font-medium text-blue-500 hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* DOB Alert */}
      <AlertDialog open={showDobAlert} onOpenChange={setShowDobAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Parental Alert</AlertDialogTitle>
            <AlertDialogDescription>
              You must be at least 16 years old to sign up. This website contains sensitive material.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowDobAlert(false)}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
