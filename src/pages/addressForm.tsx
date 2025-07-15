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
import { useEffect } from "react";

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleInitial: z.string().max(1).optional(),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  addressType: z.enum(["business", "residential", "other"], {
    required_error: "Please select an address type",
  }),
  addressLine1: z.string().min(1, "Address Line 1 required"),
  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code required"),
  state: z.string().min(1, "State/Province required"),
  country: z.string().min(1, "Country is required"),
});

type AddressFormProps = {
  address?: any;
  handleSubmit: (values: any) => void;
};

export const AddressForm = ({ address, handleSubmit }: AddressFormProps) => {
  const addressForm = useForm<z.infer<typeof addressSchema>>({
    mode: "all",

    resolver: zodResolver(addressSchema),
  });

  const { reset } = addressForm;
  useEffect(() => {
    if (address) {
      reset(address);
    } else {
      reset({
        firstName: "John",
        lastName: "Doe",
        email: "john@acme.com",
        phone: "+1 (555) 123-4567",
        addressType: "business",
        addressLine1: "123 Business Ave",
        city: "New York",
        postalCode: "10001",
        state: "NY",
        country: "United States",
      });
    }
  }, [address, reset]);

  const onSubmit = (values: z.infer<typeof addressSchema>) => {
    console.log("address", values);
    handleSubmit(values);
  };

  return (
    <Form {...addressForm}>
      <form onSubmit={addressForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={addressForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressForm.control}
            name="middleInitial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Initial</FormLabel>
                <FormControl>
                  <Input maxLength={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={addressForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={addressForm.control}
          name="addressType"
          render={({ field }) => (
            <FormItem className="mr-0 md:mr-6">
              <FormLabel>Address Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={addressForm.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={addressForm.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressForm.control}
            name="addressLine3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 3</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={addressForm.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressForm.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addressForm.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={addressForm.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Update Address</Button>
        </div>
      </form>
    </Form>
  );
};
