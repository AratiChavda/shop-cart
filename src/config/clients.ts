import type { Client, ClientKey, ClientName } from "@/types";

export const clients: Record<ClientName, Client> = {
  UNP: {
    clientName: "UNP",
    variables: {
      "--primary": "oklch(0.4855 0.199154 29.1141)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://unp-think.highwire.org/images/UNP_logo_color_home.png",
    journalBrowseURL: "https://nebraskapressjournals.unl.edu/",
    showPromoCode: false,
  },
  NW: {
    clientName: "NW",
    variables: {
      "--primary": "oklch(0.4216 0.1536 15.6869)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/News_Corp_logo_2013.svg",
    journalBrowseURL: "https://nebraskapressjournals.unl.edu/",
    showPromoCode: true,
  },
  UCP: {
    clientName: "UCP",
    variables: {
      "--primary": "oklch(0.5882 0.1619 42.87)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://www.mps-ucpress.com/images/ucp_logo_home.png",
    journalBrowseURL: "https://online.ucpress.edu/journals",
    showPromoCode: false,
  },
  UTP: {
    clientName: "UTP",
    variables: {
      "--primary": "oklch(0.5882 0.1619 42.87)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://dhjhkxawhe8q4.cloudfront.net/texas-uni-wp/wp-content/uploads/2025/02/18195056/cropped-cropped-UTP75-Logo_Homepage-bigger.png",
    journalBrowseURL: "https://utpress.utexas.edu/journals",
    showPromoCode: false,
  },
  DEV: {
    clientName: "DEV",
    variables: {
      "--primary": "oklch(0.4216 0.1536 15.6869)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://thinkprototype.mpstechnologies.com/assets/images/highwirepress-logo.svg",
    journalBrowseURL: "https://online.ucpress.edu/journals",
    showPromoCode: false,
  },
  HER: {
    clientName: "HER",
    variables: {
      "--primary": "oklch(0% 0 0)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://thinkprototype.mpstechnologies.com/assets/images/HER_logo.svg",
    journalBrowseURL: "https://online.ucpress.edu/journals",
    showPromoCode: false,
  },
  CFP: {
    clientName: "CFP",
    variables: {
      "--primary": "oklch(69.39% 0.158 258.73)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://thinkprototype.mpstechnologies.com/assets/images/CFP_logo.png",
    journalBrowseURL: "https://online.ucpress.edu/journals",
    showPromoCode: false,
  },
};

export const getClientKey = (): ClientKey => {
  if (import.meta.env.DEV) {
    return (import.meta.env.VITE_THINK365_CLIENT as ClientKey) || "DEV";
  }
  const host = window.location.hostname;
  const subdomain = host.split(".")[0].toUpperCase() as ClientKey;

  return subdomain in clients ? subdomain : "DEV";
};

export const currentClient = clients[getClientKey()];
