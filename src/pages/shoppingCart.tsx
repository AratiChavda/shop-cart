import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";
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
import { useCart } from "@/hooks/useCart";

interface CartItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  journalConfiguration: {
    orderClass: { ocId: number; orderClassName: string };
    journalCoverImgSrc?: string;
  };
  shippingAddress: Address;
  billingAddress: Address;
}

const ShoppingCart = () => {
  const { journalBrowseURL } = useClient();
  const navigate = useNavigate();
  const { user } = useUser();
  const { fetchCartCount } = useCart();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState({
    placeOrder: false,
    shipping: false,
    billing: false,
    cart: true,
    firstLoad: true,
  });

  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >();
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const tax = 0;

  const fetchBillingAddress = useCallback(async () => {
    if (!user?.customer.customerId) return null;
    setIsLoading((p) => ({ ...p, billing: true }));
    try {
      const payload = {
        class: "CustomerAddresses",
        fields: "address",
        filters: [
          {
            path: "customer.customerId",
            operator: "equals",
            value: user.customer.customerId.toString(),
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
      const { content } = await fetchEntityData(payload);
      return content?.[0]?.address ?? null;
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to fetch billing address");
      return null;
    } finally {
      setIsLoading((p) => ({ ...p, billing: false }));
    }
  }, [user?.customer.customerId]);

  const fetchShippingAddresses = useCallback(async () => {
    if (!user?.customer.customerId) return [];
    setIsLoading((p) => ({ ...p, shipping: true }));
    try {
      const payload = {
        class: "CustomerAddresses",
        fields: "address",
        filters: [
          {
            path: "customer.customerId",
            operator: "equals",
            value: user.customer.customerId.toString(),
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
      const { content } = await fetchEntityData(payload);
      return content?.map((a: any) => a.address) ?? [];
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to fetch shipping addresses");
      return [];
    } finally {
      setIsLoading((p) => ({ ...p, shipping: false }));
    }
  }, [user?.customer.customerId]);

  const fetchCart = useCallback(async () => {
    if (!user?.id) return null;
    setIsLoading((p) => ({ ...p, cart: true }));
    try {
      const payload = {
        class: "ShoppingCart",
        filters: [{ path: "user.id", operator: "equals", value: user.id }],
        fields:
          "shippingAddress.addressId, billingAddress.addressId, cartItems.itemType, cartItems.itemId, cartItems.itemName, cartItems.quantity, cartItems.unitPrice, cartItems.totalPrice, cartItems.journalConfiguration.orderClass.ocId, cartItems.journalConfiguration.orderClass.orderClassName",
      };
      const { content } = await fetchEntityData(payload);
      const cartItems = content?.[0]?.cartItems ?? [];

      if (cartItems.length) {
        const ocIds = Array.from(
          new Set(
            cartItems.map((i: any) => i.journalConfiguration.orderClass.ocId)
          )
        );
        if (ocIds.length) {
          const imgPayload = {
            class: "OcMapping",
            fields: "orderClass.ocId,journalCoverImgSrc",
            filters: [
              {
                path: "orderClass.ocId",
                operator: "in",
                value: ocIds.join(","),
              },
            ],
          };
          const imgRes = await fetchEntityData(imgPayload);
          cartItems.forEach((i: CartItem) => {
            const m = imgRes.content?.find(
              (x: any) =>
                x.orderClass.ocId === i.journalConfiguration.orderClass.ocId
            );
            if (m)
              i.journalConfiguration.journalCoverImgSrc = m.journalCoverImgSrc;
          });
        }
      }
      return { cartItems, cartData: content?.[0] };
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to fetch cart");
      return null;
    } finally {
      setIsLoading((p) => ({ ...p, cart: false, firstLoad: false }));
    }
  }, [user?.id]);

  const fetchAllData = useCallback(async () => {
    if (!user?.id || !user?.customer.customerId) return;
    try {
      const [billing, shipping, cartRes] = await Promise.all([
        fetchBillingAddress(),
        fetchShippingAddresses(),
        fetchCart(),
      ]);

      setCart(cartRes?.cartItems ?? []);
      setBillingAddress(billing);
      setShippingAddress(shipping);

      if (cartRes?.cartData) {
        const cartBillId = cartRes.cartData.billingAddress?.addressId;
        const cartShipId = cartRes.cartData.shippingAddress?.addressId;
        const validShip = shipping.some(
          (a: Address) => a.addressId === cartShipId
        );
        setSelectedAddressId(validShip ? cartShipId : undefined);
        setSameAsBilling(
          validShip && cartBillId && cartShipId && cartBillId === cartShipId
        );
      }
    } catch {
      toast.error("Failed to load cart data");
    }
  }, [fetchBillingAddress, fetchShippingAddresses, fetchCart, user]);

  const refreshCart = useCallback(async () => {
    const r = await fetchCart();
    setCart(r?.cartItems ?? []);
  }, [fetchCart]);

  const saveAddresses = useCallback(
    async (newId: number | undefined) => {
      if (!billingAddress || !newId) return;
      try {
        const payload = {
          shippingAddressId: newId,
          billingAddressId: billingAddress.addressId,
        };
        const res = await setCartAddress(payload);
        refreshCart();
        toast.success(res?.success ? "Addresses saved" : "Failed to save");
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to save addresses");
      }
    },
    [billingAddress, refreshCart]
  );

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleApplyPromoCode = async () => {
    if (!couponCode.trim()) return setPromoError("Please enter a promo code");
    setIsApplyingPromo(true);
    setPromoError("");
    try {
      await new Promise((r) => setTimeout(r, 800));
      if (couponCode.toUpperCase() === "SAVE20") {
        const sub = parseFloat(calculateSubtotal());
        setDiscount(sub * 0.2);
        toast.success("20% off applied!");
      } else {
        setPromoError("Invalid promo code");
      }
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

  const handleSameAsBilling = (c: boolean) => {
    setSameAsBilling(c);
    if (c && billingAddress) {
      setSelectedAddressId(billingAddress.addressId);
      saveAddresses(billingAddress.addressId);
    } else {
      setSelectedAddressId(undefined);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) return toast.error("Select a shipping address");
    setIsLoading((p) => ({ ...p, placeOrder: true }));
    try {
      const res = await placeOrder();
      if (!res?.success) throw new Error(res?.message ?? "Order failed");
      toast.success("Order placed!");
      await fetchCartCount();
      navigate("/dashboard/checkout", {
        state: { orderIds: res?.data?.orderId ?? [] },
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to place order");
    } finally {
      setIsLoading((p) => ({ ...p, placeOrder: false }));
    }
  };

  const calculateSubtotal = () =>
    cart.reduce((t, i) => t + i.totalPrice, 0).toFixed(2);
  const calculateTotal = () => {
    const sub = parseFloat(calculateSubtotal());
    const disc = parseFloat(discount.toFixed(2));
    return ((sub - disc) * (1 + tax)).toFixed(2);
  };

  const handleQuantityChange = async (id: number, qty: number) => {
    if (qty < 1) return;
    try {
      await updateCartItemQuantity({ cartItemId: id, quantity: qty });
      refreshCart();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteCartItem(id);
      refreshCart();
      fetchCartCount();
      toast.success("Item removed");
    } catch (e: any) {
      toast.error(e?.message ?? "Remove failed");
    }
  };

  const displayAddresses =
    sameAsBilling && billingAddress ? [billingAddress] : shippingAddress;

  return (
    <>
      {isLoading.firstLoad ? (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-40 animate-pulse" />
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/3" />
            <div className="h-12 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ) : cart.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/5 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-primary/60" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Explore journals and start writing.
          </p>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full shadow-sm"
            onClick={() => navigate(journalBrowseURL)}
          >
            Browse Journals <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-5">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-medium text-gray-900"
              >
                Your Cart
              </motion.h2>

              <div className="space-y-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="bg-white backdrop-blur-sm border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                item.journalConfiguration.journalCoverImgSrc ||
                                "/images/placeholder.jpg"
                              }
                              alt={item.itemName}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-100"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "/images/placeholder.jpg")
                              }
                            />
                            <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.itemName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {
                                item.journalConfiguration.orderClass
                                  .orderClassName
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <div className="flex items-center gap-1 bg-primary/5 rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 hover:text-primary-foreground text-primary-foreground"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 hover:text-primary-foreground text-primary-foreground"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <span className="font-medium text-gray-900 min-w-16 text-right text-sm sm:text-base">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white backdrop-blur-md border border-gray-100 rounded-2xl p-5 lg:p-6 space-y-5 transition-all ${
                isSticky ? "lg:shadow-lg lg:ring-1 lg:ring-black/5" : ""
              } lg:sticky lg:top-6 lg:self-start`}
            >
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                Order Summary
              </h3>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="h-4 w-4" />
                  Billing Address
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  {billingAddress ? (
                    <AddressCard address={billingAddress} showIcons={false} />
                  ) : (
                    <p className="text-sm text-gray-500">
                      No billing address available
                    </p>
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </div>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger
                      disabled={sameAsBilling}
                      className="text-primary hover:underline text-xs sm:text-sm font-medium disabled:opacity-50"
                    >
                      Change
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="max-h-screen overflow-y-auto p-6 sm:max-w-lg w-full"
                    >
                      <SheetHeader>
                        <SheetTitle className="text-lg">
                          Select Shipping Address
                        </SheetTitle>
                      </SheetHeader>
                      <div className="grid grid-cols-1 gap-4 mt-4">
                        {displayAddresses.map((a) => (
                          <AddressCard
                            key={a.addressId}
                            address={a}
                            isSelected={selectedAddressId === a.addressId}
                            onClick={() => {
                              setSelectedAddressId(a.addressId);
                              setIsSheetOpen(false);
                              saveAddresses(a.addressId);
                            }}
                          />
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex items-center gap-2 mb-2 pl-6">
                  <Checkbox
                    id="same"
                    checked={sameAsBilling}
                    onCheckedChange={handleSameAsBilling}
                  />
                  <label
                    htmlFor="same"
                    className="text-xs sm:text-sm text-gray-600 cursor-pointer"
                  >
                    Same as billing address
                  </label>
                </div>

                <p className="text-sm text-gray-600 pl-6">
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
                </p>
              </div>

              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="rounded-xl text-sm"
                    disabled={discount > 0}
                  />
                  {discount > 0 ? (
                    <Button
                      variant="outline"
                      onClick={handleRemovePromo}
                      className="rounded-xl text-xs sm:text-sm"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromo}
                      className="rounded-xl text-xs sm:text-sm"
                    >
                      {isApplyingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  )}
                </div>
                {promoError && (
                  <p className="text-red-500 text-xs mt-1 pl-1">{promoError}</p>
                )}
                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-1 font-medium pl-1">
                    Saved ${discount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      −${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">
                    $ 0
                    {/* {(
                      (parseFloat(calculateSubtotal()) - discount) *
                      tax
                    ).toFixed(2)} */}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-semibold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">${calculateTotal()}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-sm text-sm sm:text-base"
                onClick={handleCheckout}
                disabled={!selectedAddressId || isLoading.placeOrder}
              >
                {isLoading.placeOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingCart;
