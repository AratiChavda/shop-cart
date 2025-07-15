import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClient } from "@/hooks/useClient";

const PrivacyStatement: React.FC = () => {
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
              Privacy Statement
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-8">
          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Introduction
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              This website is owned and operated by MPS North America LLC (MPS
              NA). This Privacy Policy explains to our customers, contacts, and
              visitors how we collect, use, and share personal information that
              we obtain through this website.
            </p>
            <p className="text-gray-700 mt-2">
              MPS NA is committed to protecting the privacy and accuracy of your
              personally identifiable information to the extent possible,
              subject to provisions of state and federal law. Other than as
              required by laws that guarantee public access to certain types of
              information, or in response to subpoenas or other legal
              instruments that authorize disclosure, personally identifiable
              information is not disclosed without your consent. We take
              reasonable steps to maintain the security, integrity and privacy
              of any information in accordance with this Privacy Policy.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Data Collection
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              MPS NA may collect personal information during the login process
              used to access certain portions of our website or to use other
              functions or features, as noted. We may collect and use personally
              identifiable information including, but not limited to, the
              following: name, address, phone number, fax number, email address,
              employer, title, user ID and password, course information, credit
              card information, and IP address. Any demographic information we
              request is generally used in aggregate form for various analyses
              conducted by MPS NA regarding our website and related materials.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Use of Information Collected
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              We use personal information to provide the highest quality of
              service to our customers, prospects, and general visitors to this
              website. This may include using and reporting of de-identified,
              anonymous, aggregated data. In addition to the specific purposes
              for which we collect certain data, as described further in this
              Privacy Policy, MPS NA may collect personal information so that we
              can contact you, provide materials to you upon your request, keep
              you posted on new products and services, track your orders,
              register you, send relevant messages via email or postal mail, or
              for any other purpose identified when personal information is
              collected. Our website provides a way to indicate that you do not
              wish to receive these messages in which case we will remove your
              information from the appropriate list.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Shopping cart
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700 mt-2">
              Our online Shopping Cart uses your email address to track your
              order. This allows us to automatically send you a receipt and a
              shipping confirmation electronically, and to contact you in case
              of a problem or a need for more information to process your order.
              We reserve the right to send you periodic communications for
              marketing and promotional purposes.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Information Sharing
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              MPS NA will not disclose or share, without your consent,
              personally identifiable information, except for certain explicit
              circumstances in which disclosure may be required by law. Your
              personally identifiable information will not be distributed or
              sold to third-party organizations.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Data Protection
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              MPS NA is committed to ensuring the security of your information.
              We use industry-standard processes designed to protect sensitive
              data.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">Consent</h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              By use of the MPS NA website, and entry of any personal
              information into this site, you are consenting to the collection,
              use and transfer of your personal information as outlined in this
              Privacy Policy. If you are located outside the United States, your
              use and entry of personal information into this site constitutes
              your consent to the transfer of your personal information into the
              United States.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Updating Personal Information
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              Questions regarding your options to review, modify or delete
              previously provided personal information should be emailed to us.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">Cookies</h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              Like many companies, we use "cookies" on our website(s). Cookies
              are bits of text that are placed on your computer's hard drive
              when you visit certain websites. We use cookies to tell us, for
              example, whether you have visited us before or if you are a new
              visitor and to help us identify site features in which you may
              have the greatest interest. Cookies may enhance your online
              experience by saving your preferences while you are visiting a
              particular site. Most browsers will tell you how to stop accepting
              new cookies, how to be notified when you receive a new cookie, and
              how to disable existing cookies. Please note, however, that
              without cookies you may not be able to take full advantage of all
              our website features.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">Web Beacons</h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              Certain pages on our website contain "web beacons" (also known as
              Internet tags, pixel tags and clear GIFs or java script
              equivalents). These web beacons allow third parties to obtain
              information such as the IP address of the computer that downloaded
              the page on which the beacon appears, the URL of the page on which
              the beacon appears, the time the page containing the beacon was
              viewed, the type of browser used to view the page, and the
              information in cookies set by the third party.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              Revisions to this Privacy Policy
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              This Notice may be updated periodically and without prior notice
              to you to reflect changes in our online information practices. We
              will post a prominent notice on this site to notify you of any
              significant changes to our Notice and each version of this Privacy
              Policy will have a date, as noted below.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-800">
              How to Contact Us
            </h2>
            <Separator className="my-4" />
            <p className="text-gray-700">
              f you have any questions or comments about this Notice, or if you
              would like us to update information we have about you or your
              preferences, please contact us by:
              <br />
              Phone:{" "}
              <a
                href="tel:+14074721280"
                className="text-blue-600 hover:underline"
              >
                +1 407-472-1280
              </a>
              <br />
              Email:{" "}
              <a
                href="mailto:info@mpslimited.com"
                className="text-blue-600 hover:underline"
              >
                info@mpslimited.com
              </a>
              <br />
              Mail:
              <br />
              MPS North America LLC
              <br />
              5750 Major Blvd, Suite 100,
              <br />
              Orlando, FL 32819
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <p className="text-gray-700 text-sm">
              MPS North America LLC Privacy Policy (June 2015)
            </p>
          </motion.section>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacyStatement;
