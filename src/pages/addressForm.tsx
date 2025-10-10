import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect } from "react";
import { ADDRESS_CATEGORY, ADDRESS_TYPE } from "@/constant/common";
import type { AddressStatus, Country } from "@/types";
import { fetchGeoDataByZipCode, setAddress } from "@/api/apiServices";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().max(1).optional(),
  lastName: z.string().min(1, "Last name is required"),
  addressType: z.string().min(1, "Please select an address type"),
  addressstatus: z.string().min(1, "Address status is required"),
  addressName: z.string().min(1, "Address name is required"),
  addressLine1: z.string().min(1, "Address Line 1 required"),
  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().optional(),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Postal code required"),
  state: z.string().min(1, "State/Province required"),
  stateCode: z.string().min(1, "State/Province code required"),
  addressCategory: z.string().min(1, "Please select an address category"),
});

type addressFormValues = z.infer<typeof addressSchema>;
type AddressCategoryValues =
  (typeof ADDRESS_CATEGORY)[keyof typeof ADDRESS_CATEGORY];

interface AddressFormProps {
  address?: any;
  addressCategory: AddressCategoryValues;
  countries: Country[];
  addressStatus: AddressStatus[];
  isLoading: {
    countries: boolean;
    addressStatus: boolean;
  };
  handleCancel: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  addressCategory,
  countries,
  addressStatus,
  isLoading,
  handleCancel,
}) => {
  const addressTypes = Object.values(ADDRESS_TYPE);

  const form = useForm<addressFormValues>({
    mode: "all",
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      addressType: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      country: "",
      countryCode: "",
      city: "",
      zipCode: "",
      state: "",
      stateCode: "",
    },
  });

  const { watch, setValue } = form;

  const country = watch("country");

  const getDataBasedOnZipCode = useCallback(async () => {
    const { countryCode, zipCode } = form.getValues();
    if (!countryCode || !zipCode) return;

    try {
      const response: any = await fetchGeoDataByZipCode({
        countryCode,
        zipCode,
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

  useEffect(() => {
    const countryValue = form.getValues("country");
    if (countryValue && countries && countries.length > 0) {
      const selectedCountry = countries.find(
        (country: any) => country.name === countryValue
      );
      if (selectedCountry) {
        form.setValue("countryCode", selectedCountry.iso2, {
          shouldValidate: true,
        });
      } else {
        form.setValue("countryCode", "", { shouldValidate: true });
      }
    }
  }, [country, form, countries]);

  useEffect(() => {
    if (address) {
      setValue("firstName", address?.firstName, { shouldValidate: true });
      setValue("middleName", address?.middleName, { shouldValidate: true });
      setValue("lastName", address?.lastName, { shouldValidate: true });
      setValue("addressType", address?.addressType, { shouldValidate: true });
      setValue("addressstatus", address?.addressstatus?.id?.toString(), {
        shouldValidate: true,
      });
      setValue("addressName", address?.addressName, { shouldValidate: true });
      setValue("addressLine1", address?.addressLine1, { shouldValidate: true });
      setValue("addressLine2", address?.addressLine2, { shouldValidate: true });
      setValue("addressLine3", address?.addressLine3, { shouldValidate: true });
      setValue("country", address?.country, { shouldValidate: true });
      setValue("countryCode", address?.countryCode, { shouldValidate: true });
      setValue("city", address?.city, { shouldValidate: true });
      setValue("zipCode", address?.zipCode, { shouldValidate: true });
      setValue("state", address?.state, { shouldValidate: true });
      setValue("stateCode", address?.stateCode, { shouldValidate: true });
      setValue("addressCategory", addressCategory, { shouldValidate: true });
    }
  }, [address, addressCategory, setValue, countries]);

  const onSubmit = useCallback(
    async (data: addressFormValues) => {
      const selectedAddressStatus = addressStatus?.find(
        (status) => status?.status === data?.addressstatus
      );
      const payload = {
        ...data,
        addressId: address?.addressId || undefined,
        sameAsCustomer: false,
        status: selectedAddressStatus?.status,
        addressstatus: data?.addressstatus
          ? { id: data?.addressstatus }
          : undefined,
      };
      try {
        const response = await setAddress(payload);
        if (response) {
          toast.success(
            address?.addressId
              ? "Address updated successfully"
              : "Address saved successfully"
          );
          handleCancel();
        }
      } catch (error: any) {
        console.error("Save error:", error);
        toast.error(error?.response?.data?.message || "Failed to save address");
      }
    },
    [address?.addressId, addressStatus, handleCancel]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="addressType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address Type <span className="text-destructive">*</span>
                </FormLabel>
                <Select {...field}>
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
            name="addressstatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address Status <span className="text-destructive">*</span>
                </FormLabel>
                <Select {...field}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select address status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {addressStatus.map((type) => (
                      <SelectItem key={type.id} value={type.id?.toString()}>
                        {type.addressstatus}
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
            name="addressName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Your Address name" {...field} />
                </FormControl>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Country <span className="text-destructive">*</span>
                </FormLabel>
                <div className="relative">
                  <Select {...field} disabled={isLoading.countries}>
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
            name="zipCode"
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
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleCancel} variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Update Address</Button>
        </div>
      </form>
    </Form>
  );
};
