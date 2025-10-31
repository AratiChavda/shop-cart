import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CreditCard,
  Lock,
  Truck,
  User,
  Mail,
  Phone,
  HelpCircle,
  MapPin,
  Check,
  Copy,
} from "lucide-react";
import { ProfileForm } from "@/components/profile/profileForm";
import { PasswordForm } from "@/components/profile/passwordForm";
import { AddressForm } from "./addressForm";
import { ShippingAddress } from "@/components/profile/shippingAddress";
import { useParams } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { ADDRESS_CATEGORY } from "@/constant/common";
import { toast } from "sonner";
import { fetchAllCountries, fetchEntityData } from "@/api/apiServices";
import { type Address, type AddressStatus, type Country } from "@/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ProfilePage = () => {
  const { isAdmin, user } = useUser();
  const params = useParams();
  const [countries, setCountries] = useState<Country[]>([]);
  const [addressStatus, setAddressStatus] = useState<AddressStatus[]>([]);
  const [isLoading, setIsLoading] = useState({
    countries: false,
    addressStatus: false,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const initials = user?.username
    ?.split(" ")
    .map((word: string) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 1500);
  };

  const fetchBillingAddresse = useCallback(async () => {
    if (!user?.customer.customerId) return;
    try {
      const payload = {
        class: "CustomerAddresses",
        fields: "address",
        filters: [
          {
            path: "customer.customerId",
            operator: "equals",
            value: user?.customer.customerId.toString(),
          },
          {
            path: "address.addressCategory",
            operator: "is-not-null",
            value: "",
          },
          {
            path: "address.addressCategory",
            operator: "like",
            value: ADDRESS_CATEGORY.BILLING,
          },
        ],
      };

      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        const billingAddress = response.content?.[0]?.address;
        setBillingAddress(billingAddress || null);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch billing addresses");
    }
  }, [user?.customer.customerId]);

  const fetchCountries = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, countries: true }));
    try {
      const response = await fetchAllCountries();
      setCountries(response);
    } catch (error: any) {
      console.error("Failed to fetch countries:", error);
      toast.error("Failed to fetch countries");
    } finally {
      setIsLoading((prev) => ({ ...prev, countries: false }));
    }
  }, []);

  const fetchAddressStatus = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, addressStatus: true }));
    try {
      const payload = {
        class: "AddressStatus",
        fields: "id,status,addressstatus,defaultstatus",
        filters: [{ path: "active", operator: "is-true", value: "" }],
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setAddressStatus(
          response.content?.map((item: AddressStatus) => {
            return {
              ...item,
              id: item.id?.toString(),
            };
          })
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch address status");
    } finally {
      setIsLoading((prev) => ({ ...prev, addressStatus: false }));
    }
  }, []);

  useEffect(() => {
    fetchCountries();
    fetchAddressStatus();
  }, [fetchAddressStatus, fetchCountries]);

  const onBillingSubmit = () => {
    fetchBillingAddresse();
  };

  useEffect(() => {
    fetchBillingAddresse();
  }, [fetchBillingAddresse]);

  return isAdmin && !params?.id ? (
    <></>
  ) : (
    <div className="w-full max-w-7xl mx-auto">
      <Card
        className={cn(
          "relative overflow-hidden rounded-3xl border-0",
          "bg-white dark:bg-gray-900/70",
          "backdrop-blur-xl shadow-lg",
          "ring-1 ring-gray-200/50 dark:ring-gray-700/50",
          "hover:ring-primary/30 dark:hover:ring-primary/40 transition-all duration-300",
          "group/card"
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/10 via-transparent to-primary/10 blur-xl" />
        </div>

        <CardContent className="p-4 sm:p-2 md:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 md:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6">
              <Avatar
                className={cn(
                  "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28",
                  "border-4 border-white dark:border-gray-800 shadow-md",
                  "ring-2 ring-primary/20 dark:ring-primary/10",
                  "transition-transform duration-300 group-hover/card:scale-105"
                )}
              >
                <AvatarImage src="/profile-placeholder.jpg" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xl sm:text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <h1
                className={cn(
                  "text-2xl sm:text-3xl lg:text-4xl font-bold",
                  "bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900",
                  "bg-clip-text text-transparent",
                  "bg-[length:200%_auto]"
                )}
              >
                {user?.customer?.fname} {user?.customer?.lname}
              </h1>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/20 text-primary hover:bg-primary/15 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-800 text-white">
                <p>Need help? Contact support</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                Icon: Mail,
                color: "text-blue-600 dark:text-blue-400",
                value: user?.customer?.email || "Not provided",
                key: "email",
              },
              {
                Icon: Phone,
                color: "text-green-600 dark:text-green-400",
                value: user?.customer?.mobileNumber || "Not provided",
                key: "phone",
              },
              {
                Icon: MapPin,
                color: "text-purple-600 dark:text-purple-400",
                value:
                  billingAddress?.city && billingAddress?.state
                    ? `${billingAddress.city}, ${billingAddress.state}`
                    : "Not set",
                key: "location",
              },
            ].map(({ Icon, color, value, key }) => (
              <button
                key={key}
                onClick={() => copy(value, key)}
                className={cn(
                  "group/pill flex items-center gap-3 p-3 rounded-xl",
                  "bg-gray-50 dark:bg-gray-800/70",
                  "border border-gray-200/50 dark:border-gray-700/50",
                  "hover:border-primary/30 dark:hover:border-primary/40",
                  "hover:shadow-sm transition-all duration-200"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg bg-white dark:bg-gray-900 shadow-sm",
                    "group-hover/pill:shadow"
                  )}
                >
                  <Icon className={cn("h-4 w-4", color)} />
                </div>

                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {value}
                </span>

                <div className="ml-auto">
                  {copied === key ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400 group-hover/pill:text-primary transition-colors" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="w-full mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent shadow-primary shadow-inner p-0 border-b border-gray-200 w-full">
            {[
              { value: "profile", icon: User, text: "Profile" },
              { value: "password", icon: Lock, text: "Security" },
              ...(isAdmin
                ? []
                : [{ value: "billing", icon: CreditCard, text: "Billing" }]),
              ...(isAdmin
                ? []
                : [{ value: "shipping", icon: Truck, text: "Shipping" }]),
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center px-4 py-2 text-gray-600 data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary/50 rounded-t-lg transition-all min-w-[100px] text-sm sm:text-base"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                <span>{tab.text}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-8">
            <TabsContent
              value="profile"
              className="animate-in fade-in duration-300"
            >
              <ProfileForm />
            </TabsContent>

            <TabsContent
              value="password"
              className="animate-in fade-in duration-300"
            >
              <PasswordForm />
            </TabsContent>

            <TabsContent
              value="billing"
              className="animate-in fade-in duration-300"
            >
              <Card className="border-0 shadow-sm bg-white backdrop-blur-sm rounded-2xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <AddressForm
                    address={billingAddress}
                    addressCategory={ADDRESS_CATEGORY.BILLING}
                    countries={countries}
                    addressStatus={addressStatus}
                    isLoading={isLoading}
                    handleCancel={onBillingSubmit}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="shipping"
              className="animate-in fade-in duration-300"
            >
              <ShippingAddress
                countries={countries}
                addressStatus={addressStatus}
                isLoading={isLoading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
