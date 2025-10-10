import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TruckIcon } from "lucide-react";
import { AddressForm } from "@/pages/addressForm";
import { useUser } from "@/hooks/useUser";
import { fetchEntityData, setAddress } from "@/api/apiServices";
import { toast } from "sonner";
import type { Address, AddressStatus, Country } from "@/types";
import { ADDRESS_CATEGORY } from "@/constant/common";

interface ShippingAddressProps {
  countries: Country[];
  addressStatus: AddressStatus[];
  isLoading: {
    countries: boolean;
    addressStatus: boolean;
  };
}

export const ShippingAddress: React.FC<ShippingAddressProps> = ({
  countries,
  addressStatus,
  isLoading,
}) => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState<any>(null);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const fetchShippingAddresses = useCallback(async () => {
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
            value: ADDRESS_CATEGORY.SHIPPING,
          },
        ],
      };

      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setShippingAddresses(
          response.content?.map((addr: any) => ({
            ...addr?.address,
          })) || []
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch shipping addresses");
    }
  }, [user?.customer.customerId]);

  useEffect(() => {
    fetchShippingAddresses();
  }, [fetchShippingAddresses]);

  const onCancel = () => {
    fetchShippingAddresses();
    setAddresses(null);
    setIsAddingAddress(false);
  };

  const handleUpdateAddress = (addressId: number) => {
    const address = shippingAddresses.find(
      (addr) => addr?.addressId === addressId
    );
    setAddresses(address);
    setIsAddingAddress(true);
  };

  const setDefaultShippingAddress = async (id: number) => {
    const address = shippingAddresses.find((addr) => addr?.addressId === id);
    const payload = {
      ...address,
      primaryAddress: true,
    };
    const response: any = await setAddress(payload);
    if (response) {
      toast.success("Shipping address marked as default");
      fetchShippingAddresses();
    }
  };

  // const deleteShippingAddress = (id: string) => {
  //   setShippingAddresses(shippingAddresses.filter((addr) => addr.id !== id));
  // };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-primary" />
            <span>Shipping Addresses</span>
          </CardTitle>
          <Button variant="outline" onClick={() => setIsAddingAddress(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isAddingAddress ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Add New Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddressForm
                  address={addresses}
                  addressCategory={ADDRESS_CATEGORY.SHIPPING}
                  countries={countries}
                  addressStatus={addressStatus}
                  isLoading={isLoading}
                  handleCancel={onCancel}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : shippingAddresses.length === 0 && !isAddingAddress ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TruckIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No shipping addresses</h3>
            <p className="text-muted-foreground mb-4">
              You haven't added any shipping addresses yet.
            </p>
            <Button onClick={() => setIsAddingAddress(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {shippingAddresses.map((address) => (
              <motion.div
                key={address.addressId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border rounded-lg p-4 relative hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {address.firstName} {address.lastName}
                      {address?.primaryAddress && (
                        <Badge variant="secondary" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {address.addressType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDefaultShippingAddress(address?.addressId)
                      }
                      disabled={address.primaryAddress}
                    >
                      {address?.primaryAddress ? "Default" : "Set Default"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleUpdateAddress(address?.addressId)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm space-y-1">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  {address.addressLine3 && <p>{address.addressLine3}</p>}
                  <p>
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
