import { motion } from "framer-motion";
import {
  Users,
  Bell,
  XCircle,
  RefreshCw,
  Activity,
  TrendingUp,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: "Browse Customers",
      description: "Manage all customer accounts",
      icon: <Users className="w-6 h-6" />,
      path: "/dashboard/customers",
      stat: "1,248",
      trend: "12%",
      trendPositive: true,
    },
    {
      title: "Subscription Notifications",
      description: "Send and track notifications",
      icon: <Bell className="w-6 h-6" />,
      path: "/dashboard/claim",
      stat: "342",
      trend: "5%",
      trendPositive: true,
    },
    {
      title: "Cancellation Requests",
      description: "Process cancellation requests",
      icon: <XCircle className="w-6 h-6" />,
      path: "/dashboard/cancellation",
      stat: "24",
      trend: "3%",
      trendPositive: false,
    },
    {
      title: "Renewal Reminders",
      description: "Configure renewal workflows",
      icon: <RefreshCw className="w-6 h-6" />,
      path: "/dashboard/renewals",
      stat: "76",
      trend: "8%",
      trendPositive: true,
    },
  ];

  return (
    <div className="">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Manage all customer-related activities in one place.{" "}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5 }}
          >
            <Card
              className="h-full cursor-pointer transition-all hover:shadow-lg border-0 bg-white shadow-sm"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-2">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4`}
                >
                  {item.icon}
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{item.stat}</span>
                  <Badge
                    variant={item.trendPositive ? "default" : "destructive"}
                    className="gap-1"
                  >
                    {item.trendPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3 rotate-180" />
                    )}
                    {item.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="text-primary" />
                Subscription Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Subscription growth chart</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">MRR</p>
                  <p className="text-xl font-semibold">$24,589</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="mr-1" /> 12.5%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ARR</p>
                  <p className="text-xl font-semibold">$295,068</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="mr-1" /> 8.3%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Churn</p>
                  <p className="text-xl font-semibold">3.2%</p>
                  <p className="text-sm text-red-600 flex items-center">
                    <TrendingUp className="mr-1 rotate-180" /> 0.5%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Renewal Progress</CardTitle>
              <CardDescription>This month's renewals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Successfully renewed
                  </span>
                  <span className="text-sm font-medium">76%</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Pending renewals</span>
                  <span className="text-sm font-medium">18%</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Failed renewals</span>
                  <span className="text-sm font-medium">6%</span>
                </div>
                <Progress value={6} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
