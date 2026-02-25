"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, AlertCircle, CheckCircle2, X } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Common fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  // SignUp additional fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [addresses, setAddresses] = useState("");
  const [userType, setUserType] = useState("user");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const res = await fetch(`https://api.arcdatumcode.info/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrUsername, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        router.push("/dashboard");
      } else {
        setAlert({ type: "error", message: data.message || "Invalid credentials" });
      }
    } catch (err) {
      setLoading(false);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const res = await fetch(`https://api.arcdatumcode.info/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          addresses: [addresses],
          user_type: userType,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        router.push("/dashboard");
      } else {
        setAlert({ type: "error", message: data.message || "Sign up failed" });
      }
    } catch (err) {
      setLoading(false);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <X className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Arcdatum Corp
          </h1>
          <p className="text-zinc-400 text-sm mb-12">Your gateway to escape Matrix</p>
          
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-semibold mb-4">
              {isLogin ? "Welcome Back" : "Start Your Journey"}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {isLogin
                ? "Sign in to access your account and escape the matrix"
                : "Join thousands of satisfied customers and discover a new way to shop."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-black">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <ShoppingBag className="w-8 h-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">ShopEase</h1>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-1">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-sm text-zinc-400">
                {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
              </p>
            </div>

            {/* Alert */}
            {alert.message && (
              <Alert 
                variant={alert.type === "error" ? "destructive" : "default"} 
                className={`mb-6 ${
                  alert.type === "error" 
                    ? "bg-red-950/50 border-red-900 text-red-200" 
                    : "bg-green-950/50 border-green-900 text-green-200"
                }`}
              >
                {alert.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-200 text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-zinc-200 text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addresses" className="text-zinc-200 text-sm font-medium">
                      Address
                    </Label>
                    <Input
                      id="addresses"
                      type="text"
                      value={addresses}
                      onChange={(e) => setAddresses(e.target.value)}
                      required
                      placeholder="123 Main St, City"
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    />
                  </div>
                </>
              )}
              
              {isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername" className="text-zinc-200 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                  />
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-zinc-200 text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    placeholder="johndoe"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-200 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6 bg-white text-black hover:bg-zinc-200 font-medium" 
                disabled={loading}
              >
                {loading ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {/* Toggle link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-400">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button 
                      className="text-white font-medium hover:underline" 
                      onClick={() => setIsLogin(false)}
                      type="button"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button 
                      className="text-white font-medium hover:underline" 
                      onClick={() => setIsLogin(true)}
                      type="button"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}