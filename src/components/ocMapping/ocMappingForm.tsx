import { fetchEntityData, setOcMapping } from "@/api/apiServices";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SearchableSelect from "@/components/ui/searchableSelect";
import { Icons } from "@/components/icons";

const configSchema = z.object({
  oc: z.string().min(1, "Please select order class"),
  ocId: z.string().min(1, "Please select order class"),
  highwireCode: z.string().min(1, "Please enter code"),
  journalCoverImgSrc: z.string().min(1, "Please enter a journal cover image"),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface OrderClass {
  ocId: string;
  ocType: string;
  orderClassName: string;
}

interface OcMappingFormProps {
  mappingId: string;
  handleCancel: () => void;
}

const OcMappingForm = ({ mappingId, handleCancel }: OcMappingFormProps) => {
  const [orderClass, setOrderClass] = useState<OrderClass[]>([]);
  const [isLoading, setIsLoading] = useState({
    orderClass: false,
  });

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "all",
    defaultValues: {
      ocId: "",
      oc: "",
      highwireCode: "",
      journalCoverImgSrc: "",
    },
  });

  const {
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = form;

  const fetchOrderClass = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, orderClass: true }));
    try {
      const payload = {
        class: "OrderClass",
        fields: "ocId,ocType,orderClassName",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setOrderClass(
          response.content.map((item: any) => ({
            ...item,
            ocId: item.ocId?.toString(),
          }))
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch order classes");
    } finally {
      setIsLoading((prev) => ({ ...prev, orderClass: false }));
    }
  }, []);

  const fetchOcMapping = useCallback(async () => {
    if (!mappingId) return;
    try {
      const payload = {
        class: "OcMapping",
        fields: "id,oc,highwireCode,orderClass,journalCoverImgSrc",
        filters: [
          {
            path: "id",
            operator: "equals",
            value: mappingId,
          },
        ],
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        const data = response.content[0];
        setValue("ocId", data.orderClass?.ocId?.toString() || "");
        setValue("highwireCode", data.highwireCode || "");
        setValue("oc", data.oc || "");
        setValue("journalCoverImgSrc", data.journalCoverImgSrc || "");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch order class mapping");
      handleCancel();
    }
  }, [handleCancel, mappingId, setValue]);

  useEffect(() => {
    fetchOcMapping();
  }, [fetchOcMapping, mappingId]);

  useEffect(() => {
    fetchOrderClass();
  }, [fetchOrderClass]);

  const handleOnChange = (value: string) => {
    setValue("ocId", value, { shouldValidate: true });
    const selectedOrderClass = orderClass.find((oc) => oc.ocId == value);
    setValue("oc", selectedOrderClass?.orderClassName || "");
  };

  const onSubmit = useCallback(
    async (data: ConfigFormValues) => {
      const payload = {
        id: mappingId || undefined,
        oc: data.oc,
        orderClass: { ocId: data.ocId },
        highwireCode: data.highwireCode,
        journalCoverImgSrc: data.journalCoverImgSrc,
      };
      try {
        const response = await setOcMapping(payload);
        if (response) {
          toast.success(
            mappingId
              ? "Order class mapping updated successfully"
              : "Order class mapping saved successfully"
          );
          reset();
          handleCancel();
        }
      } catch (error: any) {
        console.error("Save error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to save order class mapping"
        );
      }
    },
    [mappingId, reset, handleCancel]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order class mapping
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Define the order class mapping with code.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="ocId" className="block font-semibold mb-2">
              Order Class <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              value={watch("ocId").toString()}
              onValueChange={(value) => handleOnChange(value)}
              options={orderClass}
              valueKey="ocId"
              labelKey="orderClassName"
              placeholder="Select Order Class"
              searchPlaceholder="Search order class..."
              notFoundMessage="No order class found."
            />
            {errors.ocId && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 text-sm text-destructive"
              >
                {errors.ocId.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label
              htmlFor="customerCategoryId"
              className="block font-semibold mb-2"
            >
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="enter code"
              {...form.register("highwireCode")}
            />
            {errors.highwireCode && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 text-sm text-destructive"
              >
                {errors.highwireCode.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="ocId" className="block font-semibold mb-2">
              Journal cover image URL{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter journal cover image URL"
              {...form.register("journalCoverImgSrc")}
            />

            {errors.journalCoverImgSrc && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 text-sm text-destructive"
              >
                {errors.journalCoverImgSrc.message}
              </motion.p>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200"
        >
          <Button variant="outline" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading.orderClass}>
            {isSubmitting ? (
              <Icons.loader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Icons.check className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Mapping"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default OcMappingForm;
