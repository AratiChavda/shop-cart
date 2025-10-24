import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CreditCard,
  Lock,
  Truck,
  User,
  Settings,
  Shield,
  Mail,
  Phone,
  Globe,
  HelpCircle,
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

function ProfilePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [addressStatus, setAddressStatus] = useState<AddressStatus[]>([]);
  const [isLoading, setIsLoading] = useState({
    countries: false,
    addressStatus: false,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const params = useParams();
  const { isAdmin, user } = useUser();

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
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-80 flex-shrink-0">
          <Card className="overflow-hidden pt-0 border-0 shadow-lg bg-white/95 backdrop-blur-md rounded-2xl transition-all hover:shadow-xl">
            <div className="relative h-28  bg-gradient-to-r from-primary via-primary/75 to-primary">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-primary/30">
                  <AvatarImage src="/profile-placeholder.jpg" />
                  <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                    {user?.username
                      ?.split(" ")
                      .map((word: string) => word[0].toUpperCase())
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-16 pb-6 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {user?.customer?.fname} {user?.customer?.lname}
              </h2>
              <p className="text-sm text-gray-500">Premium Member</p>
              <Badge
                variant="outline"
                className="mt-2 bg-primary/10 text-primary/70 border-primary/30 font-medium"
              >
                Verified
              </Badge>
            </CardContent>
          </Card>

          {!isAdmin ? (
            <>
              <Card className="mt-6 border-0 shadow-lg bg-white/95 backdrop-blur-md rounded-2xl transition-all hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {[
                    { icon: Settings, text: "Account Settings" },
                    { icon: CreditCard, text: "Billing & Payments" },
                    { icon: Truck, text: "Order History" },
                    { icon: Shield, text: "Privacy Settings" },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors rounded-lg"
                    >
                      <item.icon className="h-4 w-4 mr-3 text-primary" />
                      {item.text}
                    </Button>
                  ))}
                </CardContent>
              </Card>
              <Card className="mt-6 border-0 shadow-lg bg-white/95 backdrop-blur-md rounded-2xl transition-all hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">
                    Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Mail, text: user?.customer?.email },
                    { icon: Phone, text: user?.customer?.mobileNumber },
                    {
                      icon: Globe,
                      text: `${
                        (billingAddress?.city || "") +
                        ", " +
                        (billingAddress?.state || "") +
                        ", " +
                        (billingAddress?.countryCode || "")
                      }`,
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <item.icon className="h-4 w-4 mr-3 text-primary" />
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <></>
          )}
        </aside>

        <main className="flex-1 w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Account Settings
              </h2>
              <p className="text-sm text-gray-500">
                Manage your profile and account preferences
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/20 text-primary hover:bg-primary/15"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0 border-b border-gray-200 w-full">
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
            <div className="mt-6">
              <TabsContent value="profile">
                <ProfileForm />
              </TabsContent>

              <TabsContent value="password">
                <PasswordForm />
              </TabsContent>

              <TabsContent value="billing">
                <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center">
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

              <TabsContent value="shipping">
                <ShippingAddress
                  countries={countries}
                  addressStatus={addressStatus}
                  isLoading={isLoading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
export default ProfilePage;
