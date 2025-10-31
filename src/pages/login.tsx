import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Input, PasswordInput } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/useAuth";
import { setCartItem, userSignin } from "@/api/apiServices";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "Please enter a valid username"),
  password: z.string().min(4, "Password must be at least 4 characters"),
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
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { payload, action } = location.state || {};
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: {
      username: "",
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
    try {
      const loginPayload = {
        username: data.username,
        password: data.password,
      };
      const response = await userSignin(loginPayload);
      login(response?.data);
      if (payload && action === "addToCart") {
        setCartItem(payload)
          .then(() => {
            navigate("/dashboard/cart");
          })
          .catch((error) => {
            toast.error("Failed to add to cart");
            console.error("Error adding to cart after login:", error);
          });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid username or password");
      toast.error("Invalid username or password");
    }
  };

  const onResetSubmit = async (data: ResetFormValues) => {
    console.log("Reset request:", data);
    resetForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-lg shadow-sm p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <motion.img
            src={logo}
            alt="Company Logo"
            className="mx-auto h-12 sm:h-14 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      className="border-gray-300 focus:border-primary focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      className="border-gray-300 focus:border-primary focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-md py-2"
              >
                Sign In
              </Button>
            </motion.div>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-primary hover:underline">
                Forgot password or Customer ID?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Reset Password</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Enter your email or customer ID to receive a password reset link.
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
                        <FormLabel className="text-sm text-gray-700">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            className="border-gray-300 focus:border-primary focus:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-700">
                          Customer ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your customer ID"
                            className="border-gray-300 focus:border-primary focus:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-md py-2"
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <span className="mx-2 text-gray-500">or</span>
          <Button
            variant="link"
            className="text-primary hover:underline"
            onClick={() => navigate("/signup")}
          >
            Create account
          </Button>
        </div>
      </motion.div>
    </div>
  );
}