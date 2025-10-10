import { clients } from "@/config/clients";

export type ClientName = "DEV" | "UCP" | "UNP" | "NW" | "UTP" | "CFP" | "HER";
export interface Client {
  clientName: ClientName;
  variables: Record<string, string>;
  logo: string;
  journalBrowseURL: string;
  showPromoCode: boolean;
}

export type ClientKey = keyof typeof clients;

export interface Address {
  createdBy: string | null;
  createdAt: number;
  modifiedBy: string | null;
  modifiedAt: number;
  addressId: number;
  addressstatus: AddressStatus;
  addressName: string;
  changeType: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sameAsCustomer: boolean;
  addressType: string;
  addressCategory: string;
  status: string;
  primaryAddress: boolean;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  zipCode: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  company?: string;
  countryCode: string;
  phone?: string;
  validFrom?: string | null;
  validTo?: string | null;
  frequency?: string;
  selectionFrom?: string | null;
  selectionTo?: string | null;
  importKickOutData?: string | null;
  department?: string;
}

export interface Customer {
  createdBy: string | null;
  createdAt: number;
  modifiedBy: string | null;
  modifiedAt: number;
  customerId: number;
  customerCategory: string | null;
  thinkCategory: string | null;
  salutation: string | null;
  oldCustomerId: string | null;
  fname: string | null;
  lname: string | null;
  initialName: string | null;
  suffix: string | null;
  company: string | null;
  department: string | null;
  email: string | null;
  countryCode: string | null;
  primaryPhone: string | null;
  mobileNumber: string | null;
  specialTaxIds: string | null;
  taxId: string | null;
  taxExempt: string | null;
  secondaryEmail: string | null;
  secondaryPhone: string | null;
  listRental: string | null;
  salesRepresentative: string | null;
  creditStatus: string | null;
  fax: string | null;
  institutionalId: string | null;
  parentInstitutionalId: string | null;
  chargeTaxOn: string | null;
  paymentOptions: string | null;
  configurationOptionsforOrders: string | null;
  newOrderCommission: string | null;
  renewalCommission: string | null;
  agencyname: string | null;
  agencycode: string | null;
  paymentThreshold: string | null;
  custAuxFieldJSON: string | null;
  publisher: string | null;
  isGroup: string | null;
  doNotShip: string | null;
  customerAddresses: Array<unknown>;
  customerStatus: string | null;
  currCustomerStatusCause: string | null;
  dateUntilDeactivation: string | null;
  userIp: string | null;
  vatNumber: string | null;
  vatCountryCode: string | null;
  isAgency: boolean;
  importKickOutData: string | null;
}

export interface Role {
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  id: number;
  name: string;
  description: string;
}

export interface UserRole {
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  id: number;
  role: Role;
  isActive: boolean;
}

export interface Authority {
  authority: string;
}

export interface User {
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  id: number;
  username: string;
  customer: Customer;
  userRoles: UserRole[];
  enabled: boolean;
  authorities: Authority[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

export interface Category {
  CustomerCategoryId: string;
  custCategory: string;
  thinkCategory: string;
}

export interface Country {
  name: string;
  iso2: string;
}

export interface AddressStatus {
  active: boolean;
  status: string;
  id: number;
  addressstatus: string;
  defaultstatus: boolean;
}
