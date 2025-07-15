import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
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
import { useCart } from "@/context/cartContext";
import { toast } from "sonner";
import { ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";

const journalSchema = z.object({
  customerCategory: z.enum(["Individual", "Institutional"], {
    required_error: "Customer type is required",
  }),
  description: z.string().min(1, "Description is required"),
  issue: z.string().min(1, "Issue is required"),
  region: z.string().min(1, "Region is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type JournalForm = z.infer<typeof journalSchema>;

type Journal = {
  id?: string;
  jcode: string;
  name: string;
  image: string;
  price: number;
  descriptions: string[];
  issues: string[];
  regions: string[];
  basePrice: number;
};

const JournalPage = () => {
  // const { jcode: paramJcode } = useParams<{ jcode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const jcode = "J001";
  const id = searchParams.get("id");

  const form = useForm<JournalForm>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      customerCategory: undefined,
      description: "",
      issue: "",
      region: "",
      quantity: 1,
    },
  });

  const { watch, setValue } = form;
  const quantity = watch("quantity");
  const region = watch("region");
  const customerCategory = watch("customerCategory");

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const mockJournal: Journal = {
          id: id || undefined,
          jcode,
          name: "Sample Journal",
          image:
            "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
          price: 29.99,
          basePrice: 29.99,
          descriptions: ["Standard", "Premium"],
          issues: ["Issue #1", "Issue #2"],
          regions: ["US", "EU", "Asia"],
        };
        setJournal(mockJournal);
        setLoading(false);
        if (id) {
          setIsEditing(true);
          setValue("customerCategory", "Individual");
          setValue("description", mockJournal.descriptions[0]);
          setValue("issue", mockJournal.issues[0]);
          setValue("region", mockJournal.regions[0]);
          setValue("quantity", 1);
        }
      } catch {
        console.error("Failed to fetch journal");
        setLoading(false);
      }
    };
    fetchJournal();
  }, [jcode, id, setValue]);

  const calculatePrice = () => {
    if (!journal) return 0;
    let price = journal.basePrice;
    if (customerCategory === "Institutional") price *= 1.5;
    if (region === "EU") price *= 1.1;
    return (price * quantity).toFixed(2);
  };

  const onSubmit = (data: JournalForm) => {
    if (!journal) return;

    const cartItem = {
      id: journal.id,
      jcode: journal.jcode,
      name: journal.name,
      issue: data.issue,
      description: data.description,
      quantity: data.quantity,
      price: parseFloat(Number(calculatePrice()).toFixed(2)),
      image: journal.image,
      customerCategory: data.customerCategory,
      region: data.region,
    };

    addToCart(cartItem);
    toast.success(isEditing ? "Updated cart!" : "Added to cart!", {
      icon: <CheckCircle className="h-4 w-4 text-primary" />,
    });
    navigate("/dashboard/cart");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              {journal.name}
            </CardTitle>
            <p className="text-sm text-gray-500">Customize your subscription</p>
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
                    src={journal.image}
                    alt={journal.name}
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
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-96">
                                <SelectValue
                                  placeholder="Select customer type"
                                  className="text-primary"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Individual">
                                Individual
                              </SelectItem>
                              <SelectItem value="Institutional">
                                Institutional
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-primary/80" />
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
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-96">
                                <SelectValue
                                  placeholder="Select product description"
                                  className="text-primary"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {journal.descriptions.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-primary/80" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="issue"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-96">
                                <SelectValue
                                  placeholder="Select issue"
                                  className="text-primary"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {journal.issues.map((i) => (
                                <SelectItem key={i} value={i}>
                                  {i}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-primary/80" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="region"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-96">
                                <SelectValue
                                  placeholder="Select region"
                                  className="text-primary"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {journal.regions.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-primary/80" />
                        </FormItem>
                      )}
                    />

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
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="w-96"
                            />
                          </FormControl>
                          <FormMessage className="text-primary/80" />
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
                        Total: ${calculatePrice()}
                      </span>
                      <Button
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isEditing ? "Update Cart" : "Add to Cart"}
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
  );
};

export default JournalPage;
