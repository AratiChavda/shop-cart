import { useCart } from "@/context/cartContext";
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
  updateCartItemQuantity,
} from "@/api/apiServices";

interface ShoppingCartProps {
  user: any;
}
const ShoppingCart: React.FC<ShoppingCartProps> = ({ user }) => {
  const { journalBrowseURL } = useClient();
  const [cart, setCart] = useState([]);
  const { cartItems, updateTotalPrice } = useCart();
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [tax] = useState(0.1);
  const [isSticky, setIsSticky] = useState(false);

  const addresses = [
    {
      id: "1",
      firstName: "John",
      middleInitial: "A",
      lastName: "Doe",
      phone: "123-456-7890",
      email: "john.doe@example.com",
      addressType: "residential",
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      addressLine3: "",
      city: "City",
      postalCode: "90210",
      state: "CA",
      country: "USA",
    },
    {
      id: "2",
      firstName: "Jane",
      middleInitial: "",
      lastName: "Smith",
      phone: "987-654-3210",
      email: "jane.smith@example.com",
      addressType: "business",
      addressLine1: "456 Oak Ave",
      addressLine2: "Suite 100",
      addressLine3: "",
      city: "City",
      postalCode: "90211",
      state: "CA",
      country: "USA",
    },
    {
      id: "3",
      firstName: "Alice",
      middleInitial: "B",
      lastName: "Johnson",
      phone: "555-123-4567",
      email: "alice.johnson@example.com",
      addressType: "other",
      addressLine1: "789 Pine Rd",
      addressLine2: "",
      addressLine3: "Building C",
      city: "City",
      postalCode: "90212",
      state: "CA",
      country: "USA",
    },
    {
      id: "4",
      firstName: "Bob",
      middleInitial: "C",
      lastName: "Williams",
      phone: "444-987-6543",
      email: "bob.williams@example.com",
      addressType: "residential",
      addressLine1: "101 Maple Dr",
      addressLine2: "",
      addressLine3: "",
      city: "City",
      postalCode: "90213",
      state: "CA",
      country: "USA",
    },
  ];

  const billingAddress = {
    id: "billing",
    firstName: "John",
    middleInitial: "A",
    lastName: "Doe",
    phone: "123-456-7890",
    email: "john.doe@example.com",
    addressType: "residential",
    addressLine1: "123 Main St",
    addressLine2: "Apt 4B",
    addressLine3: "",
    city: "City",
    postalCode: "90210",
    state: "CA",
    country: "USA",
  };

  const fetchCart = useCallback(async () => {
    try {
      // setLoading(true);
      const payload = {
        class: "ShoppingCart",
        filters: [
          {
            path: "user.id",
            operator: "equals",
            value: user?.id,
          },
        ],
        fields:
          "cartItems.itemType, cartItems.itemId, cartItems.itemName, cartItems.quantity, cartItems.unitPrice, cartItems.totalPrice, cartItems.journalConfiguration.journalCoverImgSrc,cartItems.journalConfiguration.orderClass.orderClassName",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setCart(response.content?.[0]?.cartItems || []);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch cart");
    } finally {
      // setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchCart]);

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
  };

  const handleSameAsBilling = (checked: any) => {
    setSameAsBilling(checked);
    if (checked) {
      setSelectedAddressId("billing");
    } else {
      setSelectedAddressId("");
    }
  };

  const handleCheckout = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    updateTotalPrice(parseFloat(calculateTotal()));
    navigate("/dashboard/checkout");
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discountAmount = parseFloat(discount.toFixed(2));
    return ((subtotal - discountAmount) * (1 + tax)).toFixed(2);
  };

  const handleQuantityChange = async (id: number, quantity: number) => {
    const payload = {
      cartItemId: id,
      quantity,
    };
    const response = await updateCartItemQuantity(payload);
    if (response) {
      fetchCart();
    }
  };

  const handleDeleteItem = async (id: number) => {
    const response = await deleteCartItem(id);
    if (response) {
      fetchCart();
    }
  };

  const displayAddresses = sameAsBilling ? [billingAddress] : addresses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans h-full"
    >
      {cart.length === 0 ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-full text-center py-12 bg-white rounded-xl shadow-sm"
        >
          <p className="text-lg text-gray-600">Your cart is empty</p>
          <Button
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full"
            onClick={() => (window.location.href = journalBrowseURL)}
          >
            Start browsing journals <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <img
                      src={item?.journalConfiguration?.journalCoverImgSrc}
                      alt={
                        item?.journalConfiguration?.orderClass?.orderClassName
                      }
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200"
                    />
                    <div className="space-y-1">
                      <p className="text-md font-semibold text-gray-800 max-w-sm">
                        {item?.itemName}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        Price: ${item?.totalPrice?.toFixed(2)}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        Quantity: {item?.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            className={`p-4 sm:p-6 bg-white rounded-lg shadow-sm lg:sticky top-4 transition-all duration-300 ${
              isSticky ? "lg:shadow-md" : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Billing Address
                </label>
                <AddressCard address={billingAddress} showIcons={false} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  Shipping Address
                  <Sheet>
                    <SheetTrigger
                      disabled={sameAsBilling}
                      className="text-primary underline text-sm font-medium disabled:opacity-50"
                    >
                      Select
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="max-h-screen overflow-y-auto p-6 sm:max-w-2xl w-full"
                    >
                      <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-center mb-4">
                          Select Shipping Address
                        </SheetTitle>
                      </SheetHeader>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displayAddresses.map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={selectedAddressId === address.id}
                            onClick={() => setSelectedAddressId(address.id)}
                          />
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </label>

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

                {sameAsBilling ? (
                  <AddressCard address={billingAddress} showIcons={false} />
                ) : selectedAddressId ? (
                  <AddressCard
                    address={addresses.find((a) => a.id === selectedAddressId)!}
                    showIcons={false}
                  />
                ) : null}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                {discount > 0 ? (
                  <Button variant="outline" onClick={handleRemovePromo}>
                    Remove
                  </Button>
                ) : (
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo}
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

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">${calculateSubtotal()}</p>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Discount</p>
                    <p className="font-medium text-green-600">
                      -${discount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Tax (10%)</p>
                  <p className="font-medium">
                    $
                    {(
                      (parseFloat(calculateSubtotal()) -
                        parseFloat(discount.toFixed(2))) *
                      tax
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <p>Total</p>
                  <p>${calculateTotal()}</p>
                </div>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full"
                onClick={handleCheckout}
                disabled={!selectedAddressId}
              >
                Proceed to Checkout
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ShoppingCart;
