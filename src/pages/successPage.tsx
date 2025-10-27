import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { orderIds, totalPrice = 0 } =
    (location.state as { orderIds?: number[]; totalPrice?: number }) ?? {};

  useEffect(() => {
    if (!orderIds?.length) {
      navigate("/");
    }
  },[orderIds, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
              Order Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Thank you for your order. Your order{" "}
              <span className="font-medium">#{orderIds?.join(", #")}</span> has
              been confirmed.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Payment date</span>
                <span className="font-medium">{new Date().toDateString()}</span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your registered email
              address with all the details.
            </p>

            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="outline" className="w-full">
                Download Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
