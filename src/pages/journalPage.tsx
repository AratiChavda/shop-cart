import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { fetchEntityData, fetchPricing, setCartItem } from "@/api/apiServices";
import { JOURNAL_ITEM_TYPE, OC_ORDER_TYPE } from "@/constant/common";
import type { Category } from "@/types";
import { formatDate } from "@/utils/common";

const journalSchema = z
  .object({
    customerCategory: z.string().min(1, "Customer type is required"),
    description: z.string().min(1, "Description is required"),
    orderType: z.string().optional().nullable(),
    issue: z.string().nullable(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number(),
  })
  .refine(
    (data) => data.orderType !== OC_ORDER_TYPE.SINGLE_ISSUE || !!data.issue,
    {
      message: "Issue is required for single issue orders",
      path: ["issue"],
    }
  );

interface Product {
  id: string;
  description: string;
  orderType?: string;
  orderCodeId?: string;
  itemType: string;
  itemId: string;
  journalConfigurationId: string;
}

type JournalForm = z.infer<typeof journalSchema>;

interface JournalPageProps {
  user: any;
}

const JournalPage: React.FC<JournalPageProps> = ({ user }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [journal, setJournal] = useState<any | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    journal: false,
    issue: false,
  });
  const jCode = searchParams.get("jcode");

  const form = useForm<JournalForm>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      customerCategory: undefined,
      description: "",
      issue: "",
      quantity: 1,
      price: 0,
    },
  });

  const { watch } = form;
  const price = watch("price");

  const fetchJournalDetails = useCallback(async () => {
    try {
      if (!jCode) {
        return;
      }
      setIsLoading((prev) => ({ ...prev, journal: true }));

      const ocPayload = {
        class: "OcMapping",
        fields: "oc,journalCoverImgSrc,orderClass",
        filters: [
          { path: "highwireCode", operator: "equals", value: jCode || "" },
        ],
      };
      const ocResponse = await fetchEntityData(ocPayload);
      const oc = ocResponse.content?.[0]?.oc;

      if (!oc) throw new Error("No journal found");
      setJournal({
        ...ocResponse.content?.[0]?.orderClass,
        journalCoverImgSrc: ocResponse.content?.[0]?.journalCoverImgSrc,
      });

      const configPayload = {
        class: "JournalConfiguration",
        fields:
          "id,customerCategory.custCategory,orderClass.orderClassName,journalOrderCodes.orderCode.orderCodes.orderCodeId,journalOrderCodes.orderCode.orderCodes.orderType,journalOrderCodes.orderCode.orderCodes.orderCode,journalOrderCodes.orderCode.orderCodes.description,journalSubDefs.subDef.subscriptionDefCode,journalSubDefs.subDef.description,journalSubDefs.subDef.orderCode.orderCodes.orderCodeId,journalCoverImgSrc",
        filters: [
          { path: "orderClass.orderClassName", operator: "equals", value: oc },
        ],
      };
      const journalResponse = await fetchEntityData(configPayload);

      const uniqueCategories = journalResponse.content
        .map((item: any) => ({
          ...item.customerCategory,
          CustomerCategoryId:
            item.customerCategory.CustomerCategoryId.toString(),
        }))
        .filter(
          (value: any, index: number, self: any) =>
            index ===
            self.findIndex(
              (t: any) => t.CustomerCategoryId === value.CustomerCategoryId
            )
        );
      setCategories(uniqueCategories);
      setData(journalResponse.content);
    } catch (error) {
      console.error("Failed to fetch journal details:", error);
      toast.error("Failed to load journal details");
    } finally {
      setIsLoading((prev) => ({ ...prev, journal: false }));
    }
  }, [jCode]);

  const fetchIssueList = useCallback(async () => {
    try {
      if (!journal) return;
      setIsLoading((prev) => ({ ...prev, issue: true }));
      const issuePayload = {
        class: "IssueGeneration",
        fields: "id,enumeration,issueDate",
        filters: [
          {
            path: "orderClassId.ocId",
            operator: "equals",
            value: journal?.ocId,
          },
        ],
      };
      const issueResponse = await fetchEntityData(issuePayload);
      setIssues(
        issueResponse.content
          ?.map((item: any) => ({
            ...item,
            id: item.id.toString(),
          }))
          ?.sort((a: any, b: any) => b.issueDate - a.issueDate)
      );
    } catch (error) {
      console.error("Failed to fetch issue list:", error);
      toast.error("Failed to load issue list");
    } finally {
      setIsLoading((prev) => ({ ...prev, issue: false }));
    }
  }, [journal]);

  const calculatePrice = async () => {
    try {
      const product = products.find((p) => p.id === watch("description"));
      if (!product) return;
      if (product?.orderType == OC_ORDER_TYPE.SINGLE_ISSUE && !watch("issue"))
        return;
      const quantity = watch("quantity");
      const payload = {
        journalConfigurationId: product.journalConfigurationId,
        itemId: product.itemId,
        itemType: product.itemType,
        quantity,
        issueId: Number(watch("issue")),
      };
      const response = await fetchPricing(payload);
      form.setValue("price", response?.data?.totalPrice || 0);
    } catch (error) {
      console.error("Failed to calculate price:", error);
      form.setValue("price", 0);
    }
  };

  const onCategoryChange = (categoryId: string) => {
    const filteredItems = data.filter(
      (item: any) => item.customerCategory.CustomerCategoryId == categoryId
    );

    const orderCodes = filteredItems
      .flatMap((item: any) =>
        item.journalOrderCodes.map((orderCode: any) => ({
          orderCodeId: orderCode.orderCode.orderCodes.orderCodeId,
          orderType: orderCode.orderCode.orderCodes.orderType,
          orderCode: orderCode.orderCode.orderCodes.orderCode,
          description: orderCode.orderCode.orderCodes.description,
          itemType: JOURNAL_ITEM_TYPE.ORDER_CODE,
          itemId: orderCode.orderCode.orderCodes.orderCodeId,
          journalConfigurationId: item.id,
        }))
      )
      .filter((item: any) => item.orderType !== OC_ORDER_TYPE.SUBSCRIPTION);

    const subDefs = filteredItems.flatMap((item: any) =>
      item.journalSubDefs.map((subDef: any) => ({
        subscriptionDefCode: subDef.subDef.subscriptionDefCode,
        description: subDef.subDef.description,
        orderCodeId: subDef.subDef.orderCode.orderCodes.orderCodeId,
        itemType: JOURNAL_ITEM_TYPE.SUBSCRIPTION,
        itemId: subDef.subDef.id,
        journalConfigurationId: item.id,
      }))
    );

    const subDefOrderCodeIds = new Set(
      subDefs.map((subDef: any) => subDef.orderCodeId)
    );
    const uniqueOrderCodes = orderCodes.filter(
      (orderCode: any) => !subDefOrderCodeIds.has(orderCode.orderCodeId)
    );

    setProducts(
      [...uniqueOrderCodes, ...subDefs].map((item: any, index: number) => ({
        ...item,
        id: index.toString(),
      }))
    );
  };

  const onProductChange = async () => {
    const selectedProduct = products.find((p) => p.id === watch("description"));
    if (!selectedProduct) return;
    form.setValue("issue", "");
    if (selectedProduct.itemType === JOURNAL_ITEM_TYPE.ORDER_CODE) {
      form.setValue("orderType", selectedProduct.orderType);
      if (selectedProduct.orderType === OC_ORDER_TYPE.SINGLE_ISSUE) {
        fetchIssueList();
      }
    } else {
      form.setValue("orderType", "");
    }
    calculatePrice();
  };

  const onSubmit = async (data: JournalForm) => {
    const selectedProduct = products.find((p) => p.id === data.description);
    if (!selectedProduct) return;

    try {
      const payload = {
        journalConfigurationId: selectedProduct.journalConfigurationId,
        itemId: selectedProduct.itemId,
        itemType: selectedProduct.itemType,
        quantity: data.quantity,
        issueId: Number(watch("issue")),
      };
      if (!user?.id) {
        navigate("/login", {
          state: {
            payload,
            action: "addToCart",
          },
        });
        return;
      }
      await setCartItem(payload);
      toast.success("Added to cart!", {
        icon: <Icons.checkCircle className="h-4 w-4 text-primary" />,
      });
      navigate("/dashboard/cart");
    } catch (error) {
      console.error("Failed to update cart:", error);
      toast.error("Failed to update cart");
    }
  };

  useEffect(() => {
    fetchJournalDetails();
  }, [jCode, fetchJournalDetails]);

  if (isLoading.journal) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Icons.loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="p-6 border-primary/20 shadow-md rounded-lg">
          <CardTitle className="text-primary text-xl font-semibold">
            Journal Not Found
          </CardTitle>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary">
                Purchase - {data?.[0]?.orderClass?.orderClassName}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Customize your subscription
              </p>
            </CardHeader>
            <CardContent className="py-3 px-6">
              <div className="flex flex-col md:flex-row gap-6">
                <motion.div
                  className="md:w-1/3"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative group">
                    <img
                      src={journal?.journalCoverImgSrc}
                      alt={journal?.orderClassName}
                      className="rounded-lg object-cover aspect-[3/4] w-full shadow-md transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
                <div className="md:w-2/3 space-y-4">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        name="customerCategory"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Type</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                onCategoryChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-96">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Description</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                onProductChange();
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-96">
                                  <SelectValue placeholder="Select product description" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watch("orderType") === OC_ORDER_TYPE.SINGLE_ISSUE && (
                        <FormField
                          name="issue"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Issue</FormLabel>
                              <div className="relative">
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    calculatePrice();
                                  }}
                                  disabled={isLoading.issue}
                                  defaultValue={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-96">
                                      <SelectValue placeholder="Select issue" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {issues.map((issue) => (
                                      <SelectItem
                                        key={issue.id}
                                        value={issue.id}
                                      >
                                        {issue?.enumeration} (
                                        {formatDate(
                                          issue?.issueDate,
                                          "MM/dd/yyyy"
                                        )}
                                        )
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {/* {isLoading.issue && (
                                <Icons.loader className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                              )} */}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        name="quantity"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  calculatePrice();
                                }}
                                className="w-96"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <motion.div
                        className="flex items-center justify-between mt-6 p-4 bg-primary/5 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-lg font-medium text-primary">
                          Total: ${price.toFixed(2)}
                        </span>
                        <Button
                          type="submit"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Icons.cart className="mr-2 h-5 w-5" />
                          Add to Cart
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default JournalPage;
