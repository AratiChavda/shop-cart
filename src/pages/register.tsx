import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import {
  fetchAllCountries,
  fetchEntityData,
  fetchGeoDataByZipCode,
  register,
} from "@/api/apiServices";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import {
  ADDRESS_CATEGORY,
  ADDRESS_TYPE,
  CUST_CATEGORY,
} from "@/constant/common";
import type { AddressStatus, Category, Country } from "@/types";
import { Icons } from "@/components/icons";

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().max(1).optional(),
  lastName: z.string().min(1, "Last name is required"),
  organization: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  customerCategoryId: z.string().min(1, "Please select an category"),
  addressType: z.enum(
    [ADDRESS_TYPE.Business, ADDRESS_TYPE.Other, ADDRESS_TYPE.Residential],
    {
      required_error: "Please select an address type",
    }
  ),
  addressLine1: z.string().min(1, "Address Line 1 required"),
  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().optional(),
  postalCode: z.string().min(1, "Postal code required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province required"),
  stateCode: z.string().min(1, "State/Province code required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const { logo, clientName } = useClient();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addressStatus, setAddressStatus] = useState<AddressStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState({
    category: false,
    countries: false,
    address: false,
  });
  const addressTypes = Object.values(ADDRESS_TYPE);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      middleName: "",
      lastName: "",
      organization: "",
      department: "",
      phone: "",
      email: "",
      addressType: undefined,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      city: "",
      postalCode: "",
      state: "",
      stateCode: "",
      country: "",
    },
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, category: true }));
    try {
      const payload = {
        class: "CustomerCategory",
        fields: "CustomerCategoryId,custCategory,thinkCategory",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setCategories(
          response.content.map((item: any) => ({
            ...item,
            CustomerCategoryId: item.CustomerCategoryId?.toString(),
          }))
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch customer categories");
    } finally {
      setIsLoading((prev) => ({ ...prev, category: false }));
    }
  }, []);

  const fetchAddressStatus = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, address: true }));
    try {
      const payload = {
        class: "AddressStatus",
        fields: "id,status,defaultstatus",
        filters: [{ path: "active", operator: "is-true", value: "" }],
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        let defaultStatus = response.content.find(
          (item: any) => item.defaultstatus === true
        );
        if (!defaultStatus) defaultStatus = response.content[0];
        setAddressStatus(defaultStatus);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch address status");
    } finally {
      setIsLoading((prev) => ({ ...prev, address: false }));
    }
  }, []);

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

  const handleChangeCountry = (value: any) => {
    const selectedCountry: any = countries.find(
      (country: any) => country.name === value
    );
    if (selectedCountry) {
      form.setValue("countryCode", selectedCountry.iso2);
    }
  };

  const getDataBasedOnZipCode = useCallback(async () => {
    const { countryCode, postalCode } = form.getValues();
    if (!countryCode || !postalCode) return;

    try {
      const response: any = await fetchGeoDataByZipCode({
        countryCode,
        postalCode,
      });
      if (response?.postalCodes?.length) {
        const data = response.postalCodes[0];
        form.setValue(
          "city",
          ["US", "CA"].includes(countryCode)
            ? data?.placeName
            : data?.adminName2 ?? data?.placeName
        );
        form.setValue("state", data.adminName1);
        form.setValue("stateCode", data?.["ISO3166-2"]);
      }
    } catch (error: any) {
      console.error("Failed to fetch zip code data:", error);
    }
  }, [form]);

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      try {
        const customerCategory = categories.find(
          (item) => item.CustomerCategoryId === data.customerCategoryId
        );
        const payload = {
          username: data.username,
          password: data.password,
          customer: {
            fname: data.firstName,
            initialName: data.middleName,
            lname: data.lastName,
            organization: data.organization,
            department: data.department,
            mobileNumber: data.phone,
            email: data.email,
            countryCode: data.countryCode,
            customerCategory: {
              customerCategoryId: data.customerCategoryId,
            },
            customerStatus: "Active",
            isAgency: customerCategory?.thinkCategory === CUST_CATEGORY.AGENCY,
            customerAddresses: [
              {
                address: {
                  addressName: "Primary",
                  status: addressStatus?.status,
                  addressstatus: addressStatus?.id
                    ? { id: addressStatus?.id }
                    : undefined,
                  primaryAddress: true,
                  sameAsCustomer: true,
                  firstName: data.firstName,
                  middleName: data.middleName,
                  lastName: data.lastName,
                  addressType: data.addressType,
                  addressLine1: data.addressLine1,
                  addressLine2: data.addressLine2,
                  addressLine3: data.addressLine3,
                  city: data.city,
                  zipCode: data.postalCode,
                  state: data.state,
                  stateCode: data.stateCode,
                  country: data.country,
                  countryCode: data.countryCode,
                  addressCategory: ADDRESS_CATEGORY.BILLING,
                },
              },
            ],
          },
        };
        const response = await register(payload);
        toast.success(response?.message);
        navigate("/login");
      } catch (error: any) {
        console.error("Registration failed:", error);
        toast.error(error?.message || "Registration failed");
      }
    },
    [addressStatus?.id, addressStatus?.status, categories, navigate]
  );

  useEffect(() => {
    fetchCountries();
    fetchAddressStatus();
    fetchCategories();
  }, [fetchCountries, fetchCategories, fetchAddressStatus]);

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/85 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8"
      >
        <div className="text-center mb-4">
          <motion.img
            src={logo}
            alt="Company Logo"
            className="mx-auto h-16"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.h1 className="text-3xl mt-2 font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Create Your Account
          </motion.h1>
          <p className="mt-2 text-gray-600">Join us today!</p>
          {clientName === "UNP" && (
            <p className="mt-2 text-gray-600">
              {" "}
              * Your login credentials will be emailed to you after you click on
              SAVE.
            </p>
          )}
        </div>
        {(clientName == "DEV" || clientName == "UCP") && (
          <>
            <hr />
            <p className="my-4 text-gray-600">
              Below address will be treated as your <b>Billing Address</b>,
              please input details accurately. Save time and avoid frustration
              by entering the address information in the appropriate boxes and
              double-checking for typos and other errors.
            </p>
          </>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    User Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your user name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {clientName === "DEV" && (
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your middle name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {clientName == "UNP" && (
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Your organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {clientName === "DEV" && (
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Your department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Your phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading.category}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.CustomerCategoryId}
                            value={cat.CustomerCategoryId}
                          >
                            {cat.custCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoading.category && (
                      <Icons.loader className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select address type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {addressTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address Line 1 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your Address Line 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Address Line 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressLine3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 3</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Address Line 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleChangeCountry(value);
                      }}
                      defaultValue={field.value}
                      disabled={isLoading.countries}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country: any) => (
                          <SelectItem key={country.name} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoading.countries && (
                      <Icons.loader className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ZIP/Postal Code <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your ZIP/Postal Code"
                      {...field}
                      onBlur={getDataBasedOnZipCode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State/Province <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your State/Province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stateCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State/Province Code
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your State/Province code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex justify-end w-full col-span-2 gap-2"
            >
              <Button type="submit">Save</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
