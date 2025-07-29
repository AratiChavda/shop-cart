export const clients = {
  UNP: {
    key: "UNP",
    variables: {
      "--primary": "oklch(0.4855 0.199154 29.1141)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    apiBaseUrl: "https://api.unp.example.com",
    logo: "https://unp-think.highwire.org/images/UNP_logo_color_home.png",
    journalBrowseURL: "https://nebraskapressjournals.unl.edu/",
    showPromoCode: false,
    apiURL: "https://think365.mpstechnologies.com/think365setupunp",
  },
  NW: {
    key: "NW",
    variables: {
      "--primary": "oklch(0.4216 0.1536 15.6869)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/News_Corp_logo_2013.svg",
    journalBrowseURL: "https://nebraskapressjournals.unl.edu/",
    showPromoCode: true,
    apiURL: "https://think365.mpstechnologies.com/think365setupnw",
  },
  UCP: {
    key: "UCP",
    variables: {
      "--primary": "oklch(0.5882 0.1619 42.87)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://www.mps-ucpress.com/images/ucp_logo_home.png",
    journalBrowseURL: "https://online.ucpress.edu/journals",
    showPromoCode: false,
    apiURL: "https://think365.mpstechnologies.com/think365setupucp",
  },
  THINK365: {
    key: "THINK365",
    variables: {
      "--primary": "oklch(0.4216 0.1536 15.6869)",
      "--primary-foreground": "oklch(1 0 0)",
    },
    logo: "https://thinkprototype.mpstechnologies.com/assets/images/highwirepress-logo.svg",
    journalBrowseURL: "https://online.ucpress.edu/journals",
    showPromoCode: false,
    apiURL: "https://think365.mpstechnologies.com/think365setupucp",
  },
};

export type ClientKey = keyof typeof clients;

export const getClientKey = (): ClientKey => {
  if (import.meta.env.DEV) {
    return (import.meta.env.VITE_THINK365_CLIENT as ClientKey) || "UCP";
  }
  const host = window.location.hostname;
  const subdomain = host.split(".")[0].toUpperCase() as ClientKey;

  return subdomain in clients ? subdomain : "THINK365";
};

export const currentClient = clients[getClientKey()];
