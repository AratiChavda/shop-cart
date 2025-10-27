import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JournalIcon = () => (
  <motion.div
    className="relative mx-auto h-20 w-20 text-primary"
    animate={{
      y: [-5, 5],
      rotate: [-2, 2],
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    }}
  >
    <BookOpen className="w-full h-full" />
  </motion.div>
);

export default function Error404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/50 px-4 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <Card className="shadow-lg border border-primary/10 bg-background/95 backdrop-blur-sm">
          <CardContent className="pt-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 120,
              }}
            >
              <JournalIcon />
            </motion.div>
            <CardTitle className="text-5xl font-bold text-primary tracking-tight">
              <motion.span
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                404
              </motion.span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg max-w-md mx-auto">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Looks like you've turned to a missing page in our journal. Let's
                get you back to your subscription!
              </motion.p>
            </CardDescription>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex gap-4 justify-center flex-col md:flex-row"
            >
              <Button
                variant="default"
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={() => navigate("/subscriptions")}
              >
                <BookOpen className="h-4 w-4" />
                Explore Subscriptions
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
