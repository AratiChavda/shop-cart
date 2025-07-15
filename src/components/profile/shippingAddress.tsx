import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TruckIcon } from "lucide-react";
import { AddressForm, addressSchema } from "@/pages/addressForm";

type Address = z.infer<typeof addressSchema> & {
  id: string;
  isDefault: boolean;
};

export const ShippingAddress = () => {
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const onShippingSubmit = (values: z.infer<typeof addressSchema>) => {
    console.log("Shipping address added:", values);
    const newAddress = {
      ...values,
      id: `addr-${Date.now()}`,
      isDefault: shippingAddresses.length === 0,
    };
    setShippingAddresses([...shippingAddresses, newAddress]);
    setIsAddingAddress(false);
  };

  const setDefaultShippingAddress = (id: string) => {
    setShippingAddresses(
      shippingAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const deleteShippingAddress = (id: string) => {
    setShippingAddresses(shippingAddresses.filter((addr) => addr.id !== id));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-primary" />
            <span>Shipping Addresses</span>
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsAddingAddress(true)}
            className="hidden md:flex"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isAddingAddress && (
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
                <AddressForm handleSubmit={onShippingSubmit} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {shippingAddresses.length === 0 && !isAddingAddress ? (
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
                key={address.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border rounded-lg p-4 relative hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {address.firstName} {address.lastName}
                      {address.isDefault && (
                        <Badge variant="secondary" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {address.addressType === "business"
                        ? "Business"
                        : "Residential"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultShippingAddress(address.id)}
                      disabled={address.isDefault}
                    >
                      {address.isDefault ? "Default" : "Set Default"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteShippingAddress(address.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm space-y-1">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  {address.addressLine3 && <p>{address.addressLine3}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
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
