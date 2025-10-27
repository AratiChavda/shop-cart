import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowRightIcon, MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddressCard } from "@/components/shoppingCart/addressCard";
import { useClient } from "@/hooks/useClient";
import { toast } from "sonner";
import {
  deleteCartItem,
  fetchEntityData,
  placeOrder,
  setCartAddress,
  updateCartItemQuantity,
} from "@/api/apiServices";
import { ADDRESS_CATEGORY } from "@/constant/common";
import type { Address } from "@/types";
import { useUser } from "@/hooks/useUser";

interface CartItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  journalConfiguration: {
    orderClass: {
      ocId: number;
      orderClassName: string;
    };
    journalCoverImgSrc?: string;
  };
  shippingAddress: Address;
  billingAddress: Address;
}

const ShoppingCart = () => {
  const { journalBrowseURL } = useClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<{
    placeOrder: boolean;
    shipping: boolean;
    billing: boolean;
    cart: boolean;
  }>({
    placeOrder: false,
    shipping: false,
    billing: false,
    cart: false,
  });
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >(undefined);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tax] = useState(0.1); // 10% tax rate
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const fetchBillingAddress = useCallback(async () => {
    if (!user?.customer.customerId) return null;
    setIsLoading((prev) => ({ ...prev, billing: true }));
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
      return response.content?.[0]?.address || null;
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch billing address");
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, billing: false }));
    }
  }, [user?.customer.customerId]);

  const fetchShippingAddresses = useCallback(async () => {
    if (!user?.customer.customerId) return [];
    setIsLoading((prev) => ({ ...prev, shipping: true }));
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
      return response.content?.map((addr: any) => addr.address) || [];
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch shipping addresses");
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, shipping: false }));
    }
  }, [user?.customer.customerId]);

  const fetchCart = useCallback(async () => {
    if (!user?.id) return null;
    setIsLoading((prev) => ({ ...prev, cart: true }));
    try {
      const payload = {
        class: "ShoppingCart",
        filters: [
          {
            path: "user.id",
            operator: "equals",
            value: user.id,
          },
        ],
        fields:
          "shippingAddress.addressId, billingAddress.addressId, cartItems.itemType, cartItems.itemId, cartItems.itemName, cartItems.quantity, cartItems.unitPrice, cartItems.totalPrice, cartItems.journalConfiguration.orderClass.ocId, cartItems.journalConfiguration.orderClass.orderClassName",
      };
      const response = await fetchEntityData(payload);
      const cartItems = response.content?.[0]?.cartItems || [];
      if (cartItems.length) {
        const uniqueOcIds = Array.from(
          new Set(
            cartItems.map(
              (item: CartItem) => item.journalConfiguration.orderClass.ocId
            )
          )
        );
        if (uniqueOcIds.length > 0) {
          const imagePayload = {
            class: "OcMapping",
            fields: "orderClass.ocId,journalCoverImgSrc",
            filters: [
              {
                path: "orderClass.ocId",
                operator: "in",
                value: uniqueOcIds.join(","),
              },
            ],
          };
          const imageResponse = await fetchEntityData(imagePayload);
          cartItems.forEach((item: CartItem) => {
            const mapping = imageResponse.content?.find(
              (m: any) =>
                m.orderClass.ocId === item.journalConfiguration.orderClass.ocId
            );
            if (mapping) {
              item.journalConfiguration.journalCoverImgSrc =
                mapping.journalCoverImgSrc;
            }
          });
        }
      }
      return { cartItems, cartData: response.content?.[0] };
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch cart");
      return null;
    } finally {
      setIsLoading((prev) => ({ ...prev, cart: false }));
    }
  }, [user?.id]);

  const fetchAllData = useCallback(async () => {
    if (!user?.id || !user?.customer.customerId) return;
    try {
      const [billingAddressData, shippingAddressData, cartResult] =
        await Promise.all([
          fetchBillingAddress(),
          fetchShippingAddresses(),
          fetchCart(),
        ]);

      if (cartResult?.cartItems) {
        setCart(cartResult.cartItems);
      } else {
        setCart([]);
      }

      setBillingAddress(billingAddressData);
      setShippingAddress(shippingAddressData);

      if (cartResult?.cartData) {
        const cartBillingAddressId =
          cartResult.cartData.billingAddress?.addressId;
        const cartShippingAddressId =
          cartResult.cartData.shippingAddress?.addressId;

        const isValidShippingAddress = shippingAddressData.some(
          (addr: Address) => addr.addressId === cartShippingAddressId
        );

        setSelectedAddressId(
          isValidShippingAddress ? cartShippingAddressId : undefined
        );

        setSameAsBilling(
          isValidShippingAddress &&
            cartBillingAddressId &&
            cartShippingAddressId &&
            cartBillingAddressId === cartShippingAddressId
        );
      }
    } catch {
      toast.error("Failed to fetch initial data");
    }
  }, [
    fetchBillingAddress,
    fetchShippingAddresses,
    fetchCart,
    user?.id,
    user?.customer.customerId,
  ]);

  const saveAddresses = useCallback(
    async (newSelectedAddressId: number | undefined) => {
      if (!billingAddress || !newSelectedAddressId) {
        return;
      }
      try {
        const payload = {
          shippingAddressId: newSelectedAddressId,
          billingAddressId: billingAddress.addressId,
        };
        const response = await setCartAddress(payload);
        if (response?.success) {
          toast.success("Addresses saved successfully");
        } else {
          toast.error("Failed to save addresses");
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to save addresses");
      }
    },
    [billingAddress]
  );

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleApplyPromoCode = async () => {
    if (!couponCode) {
      setPromoError("Please enter a promo code");
      return;
    }
    setIsApplyingPromo(true);
    setPromoError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const isValidPromo = couponCode.toUpperCase() === "SAVE20";
      if (isValidPromo) {
        const subtotal = parseFloat(calculateSubtotal());
        const discountAmount = subtotal * 0.2;
        setDiscount(discountAmount);
        toast.success("Promo code applied!");
      } else {
        setPromoError("Invalid promo code");
      }
    } catch {
      setPromoError("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setCouponCode("");
    setDiscount(0);
    setPromoError("");
    toast.info("Promo code removed");
  };

  const handleSameAsBilling = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked && billingAddress) {
      setSelectedAddressId(billingAddress.addressId);
      saveAddresses(billingAddress.addressId);
    } else {
      setSelectedAddressId(undefined);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    setIsLoading((prev) => ({ ...prev, placeOrder: true }));
    try {
      const response = await placeOrder();
      if (!response?.success) {
        throw new Error(response?.message || "Failed to place order");
      }
      const orderIds = response?.data?.orderId || [];
      toast.success("Order placed successfully");
      navigate("/dashboard/checkout", { state: { orderIds } });
    } catch (error: any) {
      toast.error(error?.message || "Failed to place order");
    } finally {
      setIsLoading((prev) => ({ ...prev, placeOrder: false }));
    }
  };

  const calculateSubtotal = () => {
    return cart
      .reduce(
        (total: number, item: CartItem) => total + (item.totalPrice || 0),
        0
      )
      .toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discountAmount = parseFloat(discount.toFixed(2));
    return ((subtotal - discountAmount) * (1 + tax)).toFixed(2);
  };

  const refreshCart = async () => {
    try {
      const cartResult = await fetchCart();
      if (cartResult?.cartItems) {
        setCart(cartResult.cartItems);
      } else {
        setCart([]);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch cart");
    }
  };

  const handleQuantityChange = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      const payload = { cartItemId: id, quantity };
      await updateCartItemQuantity(payload);
      refreshCart();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update quantity");
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteCartItem(id);
      refreshCart();
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove item");
    }
  };

  const displayAddresses = sameAsBilling ? [billingAddress] : shippingAddress;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {cart.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center py-16 bg-primary/5 ring-1 ring-primary/10 rounded-xl shadow-sm"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Start exploring our collection of journals!
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full"
            onClick={() => (window.location.href = journalBrowseURL)}
          >
            Browse Journals <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Shopping Cart
            </h2>
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={
                        item.journalConfiguration.journalCoverImgSrc ||
                        "/images/placeholder.jpg"
                      }
                      alt={item.journalConfiguration.orderClass.orderClassName}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200"
                      onError={(e) =>
                        (e.currentTarget.src = "/images/placeholder.jpg")
                      }
                    />
                    <div className="space-y-1 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {item.itemName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Price: ${item.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-700 w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      aria-label="Remove item"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            className={`p-6 bg-white rounded-lg shadow-lg lg:sticky top-4 transition-shadow ${
              isSticky ? "lg:shadow-xl" : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Order Summary
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Billing Address
                </label>
                {billingAddress ? (
                  <AddressCard address={billingAddress} showIcons={false} />
                ) : (
                  <p className="text-sm text-gray-500">
                    No billing address available
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-600">
                    Shipping Address
                  </label>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger
                      disabled={sameAsBilling}
                      className="text-primary underline text-sm font-medium disabled:opacity-50"
                    >
                      Select
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="max-h-screen overflow-y-auto p-6 sm:max-w-lg w-full"
                    >
                      <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-center">
                          Select Shipping Address
                        </SheetTitle>
                      </SheetHeader>
                      <div className="grid grid-cols-1 gap-4 mt-4">
                        {displayAddresses.map((address) => (
                          <AddressCard
                            key={address?.addressId}
                            address={address}
                            isSelected={
                              selectedAddressId === address?.addressId
                            }
                            onClick={() => {
                              setSelectedAddressId(address?.addressId);
                              setIsSheetOpen(false);
                              saveAddresses(address?.addressId);
                            }}
                          />
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox
                    id="sameAsBilling"
                    checked={sameAsBilling}
                    onCheckedChange={handleSameAsBilling}
                  />
                  <label
                    htmlFor="sameAsBilling"
                    className="text-sm font-medium text-gray-600"
                  >
                    Same as Billing Address
                  </label>
                </div>
                {sameAsBilling && billingAddress ? (
                  <AddressCard address={billingAddress} showIcons={false} />
                ) : selectedAddressId ? (
                  <AddressCard
                    address={
                      shippingAddress.find(
                        (a) => a.addressId === selectedAddressId
                      )!
                    }
                    showIcons={false}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    Please select a shipping address
                  </p>
                )}
              </div>

              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="rounded-md"
                  />
                  {discount > 0 ? (
                    <Button variant="outline" onClick={handleRemovePromo}>
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromo}
                      className="rounded-md"
                    >
                      {isApplyingPromo ? "Applying..." : "Apply"}
                    </Button>
                  )}
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-1">{promoError}</p>
                )}
                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    Promo code applied! You saved ${discount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">
                    $
                    {(
                      (parseFloat(calculateSubtotal()) -
                        parseFloat(discount.toFixed(2))) *
                      tax
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full"
                onClick={handleCheckout}
                disabled={!selectedAddressId || isLoading.placeOrder}
              >
                {isLoading.placeOrder ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ShoppingCart;
