import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClient } from "@/hooks/useClient";

const PolicyPage: React.FC = () => {
  const { logo } = useClient();
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-12 max-w-5xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-none shadow-none">
        <CardHeader>
          <motion.div
            className="flex flex-col items-center gap-4"
            variants={itemVariants}
          >
            <img
              src={logo}
              alt="University of California Press Logo"
              className="h-12 w-auto"
            />
            <CardTitle className="text-3xl font-bold text-gray-900">
              Subscription and Delivery Policy
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-8">
          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Delivery Times
            </h2>
            <Separator className="my-4" />
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                Print copies within the US: Delivered within 30 days from the
                order date.
              </li>
              <li>
                Print copies for rest of the world: Delivered within 60 days
                from the order date.
              </li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Claims Policy
            </h2>
            <Separator className="my-4" />
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                Claims are considered premature if received within:
                <ul className="list-circle pl-6 mt-2">
                  <li>30 days after mail-date for domestic orders.</li>
                  <li>60 days after mail-date for international orders.</li>
                </ul>
              </li>
              <li>
                Claims must be made within:
                <ul className="list-circle pl-6 mt-2">
                  <li>
                    Three months of publication/order date (whichever is later)
                    for domestic subscribers.
                  </li>
                  <li>
                    Six months of publication/order date (whichever is later)
                    for international subscribers.
                  </li>
                </ul>
              </li>
              <li>
                Only two subsequent replacement requests are entertained after
                the original issue dispatch.
              </li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Subscription Policy
            </h2>
            <Separator className="my-4" />
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                Orders are firm, and subscription payments are non-refunded
                after the first issue of the volume is dispatched.
              </li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">Returns</h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              Returns should be sent to:
              <br />
              University of California Press
              <br />
              c/o MPS North America LLC
              <br />
              5750 Major Blvd., Suite 100
              <br />
              Orlando, FL 32819
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>
                An email is sent to the subscriber for every return. If the
                subscriber cannot be reached, the account is suspended
                immediately until contact is made.
              </li>
              <li>
                Based on customer input, the address is amended and/or orders
                are reinstated.
              </li>
              <li>
                For journals with less than 12 issues per year: Account
                suspended after 1st return.
              </li>
              <li>
                For journals with more than 12 issues per year: Account
                suspended after 3rd return.
              </li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Electronic Subscriptions
            </h2>
            <Separator className="my-4" />
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Available within 24 hours of subscription.</li>
              <li>
                A welcome email with an activation link and customer number will
                be sent to complete online setup.
              </li>
              <li>
                A confirmation message from SilverChair will be sent once access
                is set up.
              </li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold textinish-1">Contact Us</h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              For any questions, please contact us at:
              <br />
              Email:{" "}
              <a
                href="mailto:ucpress@mpslimited.com"
                className="text-blue-600 hover:underline"
              >
                ucpress@mpslimited.com
              </a>
              <br />
              Phone:{" "}
              <a
                href="tel:+18669785898"
                className="text-blue-600 hover:underline"
              >
                866-978-5898
              </a>
              <br />
              Address:
              <br />
              University of California Press
              <br />
              c/o MPS North America LLC
              <br />
              5750 Major Blvd., Suite 100
              <br />
              Orlando, FL 32819
            </p>
          </motion.section>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PolicyPage;
