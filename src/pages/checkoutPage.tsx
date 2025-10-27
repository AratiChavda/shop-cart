import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  // CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertCircle,
  CreditCard,
  Lock,
  //  Shield
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchEntityData, payOrder } from "@/api/apiServices";
import { toast } from "sonner";
import { PAYMENT_STATUS } from "@/constant/common";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  cardNumber: z
    .string()
    .regex(
      /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
      "Enter a valid 16-digit card number"
    ),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY format required"),
  cvc: z.string().length(3, "CVC must be 3 digits"),
  name: z.string().min(2, "Enter full name on card"),
  email: z.string().email("Invalid email address"),
  terms: z.boolean().refine((v) => v === true, "You must accept the terms"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState({
    fetch: false,
    checkout: false,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { orderIds } = (location.state as { orderIds?: number[] }) ?? {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvc: "",
      name: "",
      email: "",
      terms: false,
    },
  });

  const fetchOrderDetails = useCallback(async (ids: number[]) => {
    setIsLoading((p) => ({ ...p, fetch: true }));
    setErrorMessage(null);

    try {
      const payload = {
        class: "Order",
        fields: [
          "orderId",
          "orderStatus",
          "paymentBreakdown.paymentStatus",
          "paymentBreakdown.netAmount",
          "paymentBreakdown.currency",
        ].join(","),
        filters: [
          { path: "orderId", operator: "in", value: ids.join(",") },
          {
            path: "paymentBreakdown.paymentStatus",
            operator: "in",
            value: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.NO_PAYMENT].join(
              ","
            ),
          },
        ],
      };

      const { content } = await fetchEntityData(payload);

      if (!content?.length) {
        setErrorMessage("No payable orders found.");
        return;
      }

      const fetchedIds = content.map((o: any) => o.orderId);
      const expectedIds = ids.map(String);
      const valid = fetchedIds.every((id: number) =>
        expectedIds.includes(String(id))
      );

      if (!valid || fetchedIds.length !== ids.length) {
        setErrorMessage("One or more order IDs are invalid or already paid.");
        return;
      }

      const total = content.reduce(
        (sum: number, o: any) => sum + o.paymentBreakdown.netAmount,
        0
      );
      setTotalPrice(total);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load order details.");
    } finally {
      setIsLoading((p) => ({ ...p, fetch: false }));
    }
  }, []);

  useEffect(() => {
    if (!orderIds?.length) {
      setErrorMessage("No orders selected.");
    } else {
      fetchOrderDetails(orderIds);
    }
  }, [orderIds, fetchOrderDetails]);

  const onSubmit = async (values: FormValues) => {
    if (!values.terms) {
      toast.error("Please accept the terms");
      return;
    }

    setIsLoading((p) => ({ ...p, checkout: true }));
    try {
      const [month, year] = values.expiry.split("/");
      const payload = {
        orderId: orderIds,
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        expirationMonth: month,
        expirationYear: `20${year}`,
        securityCode: values.cvc,
        typeSelectionIndicator: "credit",
        totalAmount: totalPrice,
        currency: "USD",
      };

      const res = await payOrder(payload);
      if (!res?.success) throw new Error(res?.message ?? "Payment failed");

      toast.success("Payment successful!");
      navigate("/dashboard/success", { state: { orderIds, totalPrice } });
    } catch (err: any) {
      toast.error(err?.message ?? "Payment could not be processed");
    } finally {
      setIsLoading((p) => ({ ...p, checkout: false }));
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl"
      >
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 py-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{errorMessage}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!errorMessage && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CreditCard className="h-6 w-6" />
                    Payment Details
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Card Number{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="4242 4242 4242 4242"
                                {...field}
                                onChange={(e) => {
                                  const raw = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 16);
                                  const formatted =
                                    raw
                                      .match(/.{1,4}/g)
                                      ?.join(" ")
                                      .substr(0, 19) ?? "";
                                  field.onChange(formatted);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Expiry (MM/YY){" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="12/25"
                                  {...field}
                                  onChange={(e) => {
                                    let v = e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4);
                                    if (v.length > 2)
                                      v = v.slice(0, 2) + "/" + v.slice(2);
                                    field.onChange(v);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                CVC <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123"
                                  maxLength={3}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value.replace(/\D/g, "")
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Name on Card{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                I agree to the{" "}
                                <a href="#" className="text-primary underline">
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-primary underline">
                                  Privacy Policy
                                </a>
                                .
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={
                          isLoading.checkout ||
                          isLoading.fetch ||
                          totalPrice === 0
                        }
                      >
                        {isLoading.checkout ? (
                          "Processing..."
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Pay ${totalPrice.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>

                {/* <CardFooter className="flex items-center justify-center text-xs text-muted-foreground">
                  <Shield className="mr-1 h-4 w-4" />
                  Secured by 256-bit SSL encryption
                </CardFooter> */}
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6 shadow-lg">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Credit Card only
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
