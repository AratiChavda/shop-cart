import { useClient } from "@/hooks/useClient";

const Footer = () => {
  const { clientName } = useClient();
  return clientName == "UNP" ? (
    <div className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>
          MPS North America LLC | 941 West Morse Blvd. Ste. 100 | Winter Park,
          FL 32789
        </p>
        <p>
          Tel: <span className="text-blue-500">+1-866-978-0295</span> Email:{" "}
          <a href="mailto:journals@unl.edu" className="underline text-blue-400">
            journals@unl.edu
          </a>
        </p>
      </div>
    </div>
  ) : clientName == "UCP" ? (
    <div className="bg-gray-800 text-white py-4 px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <a
          href="http://www.symantec.com/ssl-certificates"
          className="text-blue-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ABOUT SSL CERTIFICATES
        </a>
        <div className="text-center md:text-left">
          <p>
            Copyright &copy; 2015 by MPS North America LLC. All rights reserved
          </p>
          <p>
            MPS North America LLC, 941 West Morse Blvd., Ste 100, Winter Park,
            FL 32789
          </p>
          <p>
            Tel: <span className="text-blue-500">+1-866 978 5898</span> Fax:{" "}
            <span className="text-blue-500">+1-484-302-4348</span> Email:{" "}
            <a
              href="mailto:ucpress@mpslimited.com"
              className="underline text-blue-400"
            >
              ucpress@mpslimited.com
            </a>
          </p>
        </div>
        <div className="flex justify-center md:justify-end space-x-2">
          <a href="/policy" className="text-blue-400 underline" target="_blank">
            Policy
          </a>{" "}
          <span className="border-l border-white-400 h-4 mt-1"></span>
          <a
            href="/privacyStatement"
            className="text-blue-400 underline"
            target="_blank"
          >
            Privacy Statement
          </a>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>
          &copy; {new Date().getFullYear()} MPS Limited . All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
