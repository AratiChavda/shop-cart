import { fetchEntityData, saveConfig, updateConfig } from "@/api/apiServices";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { debounce } from "lodash";
import SearchableSelect from "@/components/ui/searchableSelect";
import { Icons } from "@/components/icons";

const configSchema = z.object({
  ocId: z.string().min(1, "Please select order class"),
  customerCategoryId: z.string().min(1, "Please select customer category"),
  orderCodeIds: z
    .array(z.string())
    .min(1, "Please select at least one order code"),
  subDefSelections: z
    .array(
      z.object({
        subDefId: z.string(),
        termId: z.string().min(1, "Please select a term"),
        rateCardId: z.string().min(1, "Please select a rate card"),
      })
    )
    .min(
      1,
      "Please select at least one subscription definition with term and rate card"
    ),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface Category {
  CustomerCategoryId: string;
  custCategory: string;
  thinkCategory: string;
}

interface OrderClass {
  ocId: string;
  ocType: string;
  orderClassName: string;
}

interface OrderCode {
  orderCodeId: string;
  orderCode: string;
  orderType: string;
  description: string;
  rateCard?: {
    rcId: string;
    rateCard: string;
  };
}

interface SubscriptionDef {
  id: string;
  subscriptionDefCode: string;
  description: string;
  terms: Array<{
    termsId: string;
    term: string;
  }>;
  orderCode: {
    orderCodes: {
      rateCard?: {
        rcId: string;
        rateCard: string;
      };
    };
  };
  rateCard?: {
    rcId: string;
    rateCard: string;
  };
}

type SubDefSelection = z.infer<typeof configSchema>["subDefSelections"][0];

interface JournalConfigFormProps {
  configId: string;
  handleCancel: () => void;
}

const JournalConfigForm = ({
  configId,
  handleCancel,
}: JournalConfigFormProps) => {
  const [category, setCategory] = useState<Category[]>([]);
  const [orderClass, setOrderClass] = useState<OrderClass[]>([]);
  const [orderCodes, setOrderCodes] = useState<OrderCode[]>([]);
  const [subDefs, setSubDefs] = useState<SubscriptionDef[]>([]);
  const [isLoading, setIsLoading] = useState({
    category: false,
    orderClass: false,
    orderCodes: false,
    subDefs: false,
  });
  const [tempSelectedOrderCodeIds, setTempSelectedOrderCodeIds] = useState<
    string[]
  >([]);
  const [tempSelectedSubDefSelections, setTempSelectedSubDefSelections] =
    useState<SubDefSelection[]>([]);
  const [orderCodeFilter, setOrderCodeFilter] = useState("");
  const [subDefFilter, setSubDefFilter] = useState("");
  const [isOrderCodeModalOpen, setIsOrderCodeModalOpen] = useState(false);
  const [isSubDefModalOpen, setIsSubDefModalOpen] = useState(false);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "all",
    defaultValues: {
      ocId: "",
      customerCategoryId: "",
      orderCodeIds: [],
      subDefSelections: [],
    },
  });

  const {
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
    reset,
  } = form;
  const selectedOcId = watch("ocId");
  const selectedOrderCodeIds = watch("orderCodeIds");
  const selectedSubDefSelections = watch("subDefSelections");

  const fetchCategory = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, category: true }));
    try {
      const payload = {
        class: "CustomerCategory",
        fields: "CustomerCategoryId,custCategory,thinkCategory",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setCategory(
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

  const fetchOrderCodes = useCallback(async () => {
    if (!selectedOcId) return;
    setIsLoading((prev) => ({ ...prev, orderCodes: true }));
    try {
      const payload = {
        class: "OrderCodesSuper",
        fields:
          "orderCodes.orderCodeId,orderCodes.orderCode,orderCodes.orderType,orderCodes.description,orderCodes.rateCard.rcId,orderCodes.rateCard.rateCard",
        filters: [
          {
            path: "orderClass.ocId",
            operator: "equals",
            value: selectedOcId,
          },
        ],
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        const allOrderCodes = response.content.flatMap(
          (item: any) => item.orderCodes || []
        );
        setOrderCodes(
          allOrderCodes.map((item: any) => ({
            ...item,
            orderCodeId: item.orderCodeId?.toString(),
            rateCard: item.rateCard
              ? {
                  rcId: item.rateCard.rcId?.toString(),
                  rateCard: item.rateCard.rateCard,
                }
              : undefined,
          }))
        );
      } else {
        setOrderCodes([]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch order codes");
    } finally {
      setIsLoading((prev) => ({ ...prev, orderCodes: false }));
    }
  }, [selectedOcId]);

  const fetchSubDef = useCallback(async () => {
    if (!selectedOrderCodeIds.length) {
      setSubDefs([]);
      setValue("subDefSelections", []);
      return;
    }
    setIsLoading((prev) => ({ ...prev, subDefs: true }));
    try {
      const orderCodeIds = selectedOrderCodeIds.join(",");
      const payload = {
        class: "SubscriptionDefKeyInfo",
        fields:
          "id,subscriptionDefCode,description,terms.term,terms.termsId,rateCard.rcId,rateCard.rateCard,orderCode.orderCodes.rateCard.rcId,orderCode.orderCodes.rateCard.rateCard",
        filters: [
          {
            path: "orderCode.orderCodes.orderCodeId",
            operator: "in",
            value: orderCodeIds,
          },
        ],
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setSubDefs(
          response.content.map((item: any) => ({
            ...item,
            id: item.id?.toString(),
            terms: item.terms?.map((term: any) => ({
              termsId: term.termsId?.toString(),
              term: term.term,
            })),
            rateCard: item.rateCard
              ? {
                  rcId: item.rateCard.rcId?.toString(),
                  rateCard: item.rateCard.rateCard,
                }
              : undefined,
            orderCode: {
              ...item.orderCode,
              orderCodes: {
                ...item.orderCode.orderCodes,
                rateCard: item.orderCode.orderCodes?.rateCard
                  ? {
                      rcId: item.orderCode.orderCodes?.rateCard.rcId?.toString(),
                      rateCard: item.orderCode.orderCodes?.rateCard.rateCard,
                    }
                  : undefined,
              },
            },
          }))
        );
      } else {
        setSubDefs([]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch subscription definitions");
    } finally {
      setIsLoading((prev) => ({ ...prev, subDefs: false }));
    }
  }, [selectedOrderCodeIds, setValue]);

  const fetchConfigDetails = useCallback(async () => {
    if (!configId) {
      form.reset({
        ocId: "",
        customerCategoryId: "",
        orderCodeIds: [],
        subDefSelections: [],
      });
      setTempSelectedOrderCodeIds([]);
      setTempSelectedSubDefSelections([]);
      return;
    }
    try {
      const payload = {
        class: "JournalConfiguration",
        fields:
          "id,customerCategory.custCategory,orderClass.orderClassName,journalOrderCodes.orderCode.orderCodes,journalSubDefs.subDef.subscriptionDefCode,journalSubDefs.term.termsId,journalSubDefs.rateCard.rcId",
        filters: [
          {
            path: "id",
            operator: "equals",
            value: configId,
          },
        ],
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        const data = response.content[0];
        const formData: ConfigFormValues = {
          ocId: data?.orderClass?.ocId?.toString() || "",
          customerCategoryId:
            data?.customerCategory?.CustomerCategoryId?.toString() || "",
          orderCodeIds:
            data?.journalOrderCodes?.map((item: any) =>
              item?.orderCode?.orderCodes?.orderCodeId?.toString()
            ) || [],
          subDefSelections:
            data?.journalSubDefs?.map((item: any) => ({
              subDefId: item?.subDef?.id?.toString() || "",
              termId: item?.term?.termsId?.toString() || "",
              rateCardId: item?.rateCard?.rcId?.toString() || "",
            })) || [],
        };
        form.reset(formData);
        console.log(formData);
        setTempSelectedOrderCodeIds(formData.orderCodeIds);
        setTempSelectedSubDefSelections(formData.subDefSelections);
        await trigger();
      } else {
        toast.error("No configuration found for the provided ID");
        handleCancel();
      }
    } catch (error: any) {
      console.error("Error fetching config details:", error);
      toast.error("Failed to fetch configuration details");
      handleCancel();
    }
  }, [configId, form, trigger, handleCancel]);

  useEffect(() => {
    fetchConfigDetails();
  }, [configId, fetchConfigDetails]);

  useEffect(() => {
    fetchCategory();
    fetchOrderClass();
  }, [fetchCategory, fetchOrderClass]);

  useEffect(() => {
    fetchOrderCodes();
  }, [fetchOrderCodes]);

  useEffect(() => {
    fetchSubDef();
  }, [fetchSubDef]);

  const onSubmit = useCallback(
    async (data: ConfigFormValues) => {
      const payload = {
        id: configId || undefined,
        orderClass: {
          ocId: data.ocId,
        },
        customerCategory: {
          customerCategoryId: data.customerCategoryId,
        },
        journalOrderCodes: data.orderCodeIds.map((id: string) => ({
          orderCode: {
            id: id,
          },
        })),
        journalSubDefs: data.subDefSelections.map((selection) => ({
          subDef: {
            id: selection.subDefId,
          },
          term: {
            termsId: selection.termId,
          },
          rateCard: {
            rcId: selection.rateCardId,
          },
        })),
      };
      try {
        let response = null;
        if (configId) {
          response = await updateConfig(payload);
        } else {
          response = await saveConfig(payload);
        }
        if (response) {
          toast.success(
            configId
              ? "Config updated successfully"
              : "Config saved successfully"
          );
          reset();
          setOrderCodes([]);
          setSubDefs([]);
          setOrderCodeFilter("");
          setSubDefFilter("");
          handleCancel();
        }
      } catch (error: any) {
        console.error("Save error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to save configuration"
        );
      }
    },
    [configId, reset, handleCancel]
  );

  const debouncedSetOrderCodeFilter = useMemo(
    () =>
      debounce((value: string) => {
        setOrderCodeFilter(value);
      }, 300),
    []
  );

  const debouncedSetSubDefFilter = useMemo(
    () =>
      debounce((value: string) => {
        setSubDefFilter(value);
      }, 300),
    []
  );

  const filteredOrderCodes = useMemo(
    () =>
      orderCodes.filter(
        (code) =>
          code.orderCode
            .toLowerCase()
            .includes(orderCodeFilter.toLowerCase()) ||
          code.orderType
            .toLowerCase()
            .includes(orderCodeFilter.toLowerCase()) ||
          code.description.toLowerCase().includes(orderCodeFilter.toLowerCase())
      ),
    [orderCodes, orderCodeFilter]
  );

  const filteredSubDefs = useMemo(
    () =>
      subDefs.filter(
        (def) =>
          def.subscriptionDefCode
            .toLowerCase()
            .includes(subDefFilter.toLowerCase()) ||
          def.description.toLowerCase().includes(subDefFilter.toLowerCase())
      ),
    [subDefs, subDefFilter]
  );

  const getAvailableRateCards = useCallback(
    (subDefId: string) => {
      const subDef = subDefs.find((def) => def.id === subDefId);
      const rateCards: { rcId: string; rateCard: string }[] = [];

      if (subDef?.rateCard) {
        rateCards.push(subDef.rateCard);
      }

      if (
        subDef?.orderCode.orderCodes?.rateCard &&
        !rateCards.some(
          (rc) => rc.rcId === subDef.orderCode.orderCodes.rateCard?.rcId
        )
      ) {
        rateCards.push(subDef.orderCode.orderCodes.rateCard);
      }

      return rateCards;
    },
    [subDefs]
  );

  const handleOpenOrderCodeModal = useCallback(() => {
    setTempSelectedOrderCodeIds([...selectedOrderCodeIds]);
    setIsOrderCodeModalOpen(true);
  }, [selectedOrderCodeIds]);

  const handleToggleTempOrderCodeSelection = useCallback((id: string) => {
    setTempSelectedOrderCodeIds((currentSelection) => {
      if (currentSelection.includes(id)) {
        return currentSelection.filter((item) => item !== id);
      } else {
        return [...currentSelection, id];
      }
    });
  }, []);

  const handleOrderCodeModalDone = useCallback(() => {
    setValue("orderCodeIds", tempSelectedOrderCodeIds, {
      shouldValidate: true,
    });

    const validSubDefsForNewSelection = subDefs
      .filter(() =>
        tempSelectedOrderCodeIds.some((ocId) =>
          orderCodes.find((oc) => oc.orderCodeId === ocId)
        )
      )
      .map((def) => def.id);

    setValue(
      "subDefSelections",
      selectedSubDefSelections.filter((sel) =>
        validSubDefsForNewSelection.includes(sel.subDefId)
      ),
      { shouldValidate: true }
    );

    setIsOrderCodeModalOpen(false);
  }, [
    tempSelectedOrderCodeIds,
    setValue,
    selectedSubDefSelections,
    subDefs,
    orderCodes,
  ]);

  const handleOpenSubDefModal = useCallback(() => {
    setTempSelectedSubDefSelections([...selectedSubDefSelections]);
    setIsSubDefModalOpen(true);
  }, [selectedSubDefSelections]);

  const handleToggleTempSubDefSelection = useCallback(
    (def: SubscriptionDef, checked: boolean) => {
      setTempSelectedSubDefSelections((currentSelections) => {
        const existingIndex = currentSelections.findIndex(
          (sel) => sel.subDefId === def.id
        );

        if (checked) {
          const defaultTerm = def.terms[0]?.termsId?.toString() || "";
          const defaultRateCard =
            getAvailableRateCards(def.id)[0]?.rcId?.toString() || "";
          const newSelection: SubDefSelection = {
            subDefId: def.id,
            termId: defaultTerm,
            rateCardId: defaultRateCard,
          };
          if (existingIndex >= 0) {
            const updated = [...currentSelections];
            updated[existingIndex] = newSelection;
            return updated;
          } else {
            return [...currentSelections, newSelection];
          }
        } else {
          return currentSelections.filter(
            (_, index) => index !== existingIndex
          );
        }
      });
    },
    [getAvailableRateCards]
  );

  const handleTempSubDefValueChange = useCallback(
    (subDefId: string, newTermId: string, newRateCardId: string) => {
      setTempSelectedSubDefSelections((currentSelections) => {
        const existingIndex = currentSelections.findIndex(
          (sel) => sel.subDefId === subDefId
        );

        if (existingIndex >= 0) {
          const updatedSelections = [...currentSelections];
          updatedSelections[existingIndex] = {
            subDefId,
            termId: newTermId,
            rateCardId: newRateCardId,
          };
          return updatedSelections;
        }
        return currentSelections;
      });
    },
    []
  );

  const handleSubDefModalDone = useCallback(() => {
    setValue("subDefSelections", tempSelectedSubDefSelections, {
      shouldValidate: true,
    });

    setIsSubDefModalOpen(false);
  }, [tempSelectedSubDefSelections, setValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Journal Configuration
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Define the relationship between customer categories, order classes,
          and subscription logic.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label
              htmlFor="customerCategoryId"
              className="block font-semibold mb-2"
            >
              Customer Category
            </Label>
            <div className="relative">
              <Select
                value={watch("customerCategoryId").toString()}
                onValueChange={(value) =>
                  setValue("customerCategoryId", value, {
                    shouldValidate: true,
                  })
                }
                disabled={isLoading.category || isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Customer Category" />
                </SelectTrigger>
                <SelectContent>
                  {category.map((cat) => (
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
            {errors.customerCategoryId && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 text-sm text-destructive"
              >
                {errors.customerCategoryId.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="ocId" className="block font-semibold mb-2">
              Order Class
            </Label>
            <SearchableSelect
              value={watch("ocId").toString()}
              onValueChange={(value) => {
                setValue("ocId", value, { shouldValidate: true });
                setValue("orderCodeIds", []);
                setOrderCodeFilter("");
                setValue("subDefSelections", []);
                setSubDefFilter("");
              }}
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs
            defaultValue="orderCodes"
            className="w-full shadow-lg overflow-hidden"
          >
            <TabsList className="w-full p-1 border-b">
              <TabsTrigger value="orderCodes">
                Order Codes ({selectedOrderCodeIds.length})
                {selectedOrderCodeIds.length > 0 && (
                  <Icons.checkCircle2 className="ml-2 h-5 w-5 text-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="subDefs"
                disabled={selectedOrderCodeIds.length === 0}
              >
                Subscription Definitions ({selectedSubDefSelections.length})
                {selectedSubDefSelections.length > 0 && (
                  <Icons.checkCircle2 className="ml-2 h-5 w-5 text-green-500" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orderCodes" className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">
                    Select Order Codes
                  </h3>
                  <p className="text-sm text-slate-500">
                    Codes must be linked to the selected Order Class.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleOpenOrderCodeModal}
                  disabled={
                    !selectedOcId || isLoading.orderCodes || isSubmitting
                  }
                  className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto"
                >
                  {isLoading.orderCodes ? (
                    <Icons.loader className="animate-spin h-5 w-5" />
                  ) : (
                    <Icons.plus className="h-5 w-5" />
                  )}
                  {isLoading.orderCodes ? "Loading..." : "Add Order Codes"}
                </Button>
              </div>
              <AnimatePresence mode="wait">
                {selectedOrderCodeIds.length > 0 ? (
                  <motion.div
                    key="chips"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 min-h-[50px]"
                  >
                    {selectedOrderCodeIds.map((id) => {
                      const code = orderCodes.find((c) => c.orderCodeId === id);
                      return (
                        <motion.div
                          key={id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="inline-flex items-center bg-primary text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                        >
                          <span>{code?.orderCode || "N/A"}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setValue(
                                "orderCodeIds",
                                selectedOrderCodeIds.filter(
                                  (item) => item !== id
                                )
                              );
                              trigger("orderCodeIds");
                            }}
                            className="ml-2 h-5 w-5 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
                          >
                            <Icons.x className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 text-slate-500 border border-dashed rounded-lg"
                  >
                    Click <b>Add Order Codes</b> to begin selection.
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.orderCodeIds && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.orderCodeIds.message}
                </p>
              )}
            </TabsContent>

            <TabsContent value="subDefs" className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">
                    Select Subscription Definitions
                  </h3>
                  <p className="text-sm text-slate-500">
                    Select the specific <b>Term</b> and <b>Rate Card</b> for
                    each Subscription Definition.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleOpenSubDefModal}
                  disabled={
                    selectedOrderCodeIds.length === 0 ||
                    isLoading.subDefs ||
                    isSubmitting
                  }
                  className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto"
                >
                  {isLoading.subDefs ? (
                    <Icons.loader className="animate-spin h-5 w-5" />
                  ) : (
                    <Icons.plus className="h-5 w-5" />
                  )}
                  {isLoading.subDefs ? "Loading..." : "Configure Subscriptions"}
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {selectedSubDefSelections.length > 0 ? (
                  <motion.div
                    key="selection-table"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-x-auto rounded-lg border"
                  >
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[50px]">Status</TableHead>
                          <TableHead className="min-w-[150px]">
                            Subscription Def
                          </TableHead>
                          <TableHead className="min-w-[150px]">Term</TableHead>
                          <TableHead className="min-w-[150px]">
                            Rate Card
                          </TableHead>
                          <TableHead className="w-[50px] text-right">
                            Remove
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSubDefSelections.map((selection) => {
                          const def = subDefs.find(
                            (d) => d.id === selection.subDefId
                          );
                          const term = def?.terms.find(
                            (t) => t.termsId === selection.termId
                          );
                          const rateCard = getAvailableRateCards(
                            selection.subDefId
                          ).find((rc) => rc.rcId === selection.rateCardId);
                          return (
                            <motion.tr
                              key={selection.subDefId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-primary/5 transition-colors"
                            >
                              <TableCell>
                                <Icons.checkCircle2 className="h-5 w-5 text-green-500" />
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {def?.subscriptionDefCode || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {term?.term || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {rateCard?.rateCard || "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setValue(
                                      "subDefSelections",
                                      selectedSubDefSelections.filter(
                                        (s) => s.subDefId !== selection.subDefId
                                      ),
                                      { shouldValidate: true }
                                    )
                                  }
                                  className="h-7 w-7 text-red-500 hover:bg-red-50"
                                >
                                  <Icons.x className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 text-slate-500 border border-dashed rounded-lg"
                  >
                    Click <b>Configure Subscriptions</b> to define terms and
                    rate cards.
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.subDefSelections && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.subDefSelections.message}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200"
        >
          <Button variant="outline" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoading.category ||
              isLoading.orderClass ||
              isLoading.orderCodes ||
              isLoading.subDefs
            }
          >
            {isSubmitting ? (
              <Icons.loader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Icons.check className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </motion.div>
      </form>

      <Dialog
        open={isOrderCodeModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsOrderCodeModalOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Select Order Codes
            </DialogTitle>
            <DialogDescription>
              Check the box next to each order code you wish to include.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative mb-4"
          >
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Filter by Order Code, Type, or Description..."
              onChange={(e) =>
                debouncedSetOrderCodeFilter(e.target.value || "")
              }
              className="pl-10"
            />
          </motion.div>
          {filteredOrderCodes.length > 0 ? (
            <div className="overflow-auto max-h-[60vh] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-slate-50 shadow-sm z-10">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="min-w-[100px]">Order Code</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Order Type
                    </TableHead>
                    <TableHead className="min-w-[150px]">Description</TableHead>
                    <TableHead>Rate Card</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filteredOrderCodes.map((code) => (
                      <motion.tr
                        key={code.orderCodeId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "transition-colors hover:bg-slate-50 cursor-pointer",
                          tempSelectedOrderCodeIds.includes(code.orderCodeId) &&
                            "bg-primary/10 hover:bg-primary/20"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={tempSelectedOrderCodeIds.includes(
                              code.orderCodeId
                            )}
                            onCheckedChange={() =>
                              handleToggleTempOrderCodeSelection(
                                code.orderCodeId
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {code.orderCode}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                            {code.orderType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[100px] sm:max-w-md">
                          {code.description}
                        </TableCell>
                        <TableCell className="text-xs">
                          {code.rateCard ? code.rateCard.rateCard : "N/A"}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 border border-dashed rounded-lg">
              {orderCodeFilter
                ? "No order codes match your search criteria."
                : "No order codes available for the selected Order Class."}
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsOrderCodeModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleOrderCodeModalDone} type="button">
              Done ({tempSelectedOrderCodeIds.length} Selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSubDefModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSubDefModalOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Select Subscription Definitions
            </DialogTitle>
            <DialogDescription>
              For each definition, select the required <b>Term</b> and{" "}
              <b>Rate Card</b> from the dropdowns.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative mb-4"
          >
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Filter by Subscription Code or Description..."
              onChange={(e) => debouncedSetSubDefFilter(e.target.value)}
              className="pl-10"
            />
          </motion.div>
          {filteredSubDefs.length > 0 ? (
            <div className="overflow-auto max-h-[60vh] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-slate-50 shadow-sm z-10">
                    <TableHead className="w-[50px] min-w-[50px]">
                      Select
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      Subscription Code
                    </TableHead>
                    <TableHead className="min-w-[150px]">Description</TableHead>
                    <TableHead className="w-[180px] min-w-[180px]">
                      Term <span className="text-destructive">*</span>
                    </TableHead>
                    <TableHead className="w-[180px] min-w-[180px]">
                      Rate Card <span className="text-destructive">*</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filteredSubDefs.map((def) => {
                      const currentSelection =
                        tempSelectedSubDefSelections.find(
                          (sel) => sel.subDefId === def.id
                        );
                      const rateCards = getAvailableRateCards(def.id);
                      const selectedTermId = currentSelection
                        ? currentSelection.termId
                        : "";
                      const selectedRateCardId = currentSelection
                        ? currentSelection.rateCardId
                        : "";

                      return (
                        <motion.tr
                          key={def.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "transition-colors",
                            currentSelection &&
                              "bg-primary/10 hover:bg-primary/20"
                          )}
                        >
                          <TableCell>
                            <Checkbox
                              checked={!!currentSelection}
                              onCheckedChange={(checked: boolean) =>
                                handleToggleTempSubDefSelection(def, checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {def.subscriptionDefCode}
                          </TableCell>
                          <TableCell className="text-sm truncate max-w-[150px]">
                            {def.description}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={selectedTermId}
                              onValueChange={(newTermId) =>
                                handleTempSubDefValueChange(
                                  def.id,
                                  newTermId,
                                  selectedRateCardId
                                )
                              }
                              disabled={!currentSelection}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Term" />
                              </SelectTrigger>
                              <SelectContent>
                                {def.terms.map((term) => (
                                  <SelectItem
                                    key={`${def.id}-${term.termsId}`}
                                    value={term.termsId}
                                  >
                                    {term.term}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={selectedRateCardId}
                              onValueChange={(newRateCardId) =>
                                handleTempSubDefValueChange(
                                  def.id,
                                  selectedTermId,
                                  newRateCardId
                                )
                              }
                              disabled={!currentSelection}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Rate Card" />
                              </SelectTrigger>
                              <SelectContent>
                                {rateCards.map((rc) => (
                                  <SelectItem
                                    key={`${def.id}-${rc.rcId}`}
                                    value={rc.rcId}
                                  >
                                    {rc.rateCard}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 border border-dashed rounded-lg">
              No Subscription Definitions are available for the currently
              selected Order Codes.
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsSubDefModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleSubDefModalDone} type="button">
              Done ({tempSelectedSubDefSelections.length} Selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default JournalConfigForm;
