import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useClient } from "@/hooks/useClient";
import { useAuth } from "@/context/authContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const resetSchema = z
  .object({
    email: z.string().email("Please enter a valid email").optional(),
    customerId: z.string().min(1, "Please enter a customer ID").optional(),
  })
  .refine((data) => data.email || data.customerId, {
    message: "Please provide either email or customer ID",
    path: ["email"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export function Login() {
  const { login } = useAuth();
  const { logo } = useClient();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    mode: "all",
    defaultValues: {
      email: "",
      customerId: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (data) {
      localStorage.setItem(
        "role",
        data?.email == "aratichavda31@gmail.com" ? "Admin" : "user"
      );
      login();
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  const onResetSubmit = async (data: ResetFormValues) => {
    console.log("Reset request:", data);
    resetForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8"
      >
        <div className="text-center mb-8">
          <motion.img
            src={logo}
            alt="Company Logo"
            className="mx-auto h-16 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.h1 className="text-3xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Welcome Back
          </motion.h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </motion.div>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="cursor-pointer">
                  Forgot your password or Customer ID?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter either your email or customer ID to receive a password
                    reset link.
                  </DialogDescription>
                </DialogHeader>
                <Form {...resetForm}>
                  <form
                    onSubmit={resetForm.handleSubmit(onResetSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Your customer ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <span className="mx-2">or</span>
            <Button
              variant="link"
              className="cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Create account
            </Button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
