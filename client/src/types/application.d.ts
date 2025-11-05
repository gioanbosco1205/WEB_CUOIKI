// types/application.d.ts
export interface Location {
  city: string;
  country: string;
}

export interface Property {
  id: number;
  name: string;
  location: Location;
  pricePerMonth: number;
  photoUrls?: string[];
}

export interface User {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Lease {
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
}

export interface Application {
  id: number;
  status: "Pending" | "Approved" | "Denied";
  applicationDate: string;
  property: Property;
  tenant: User;
  manager: User;
  lease: Lease;
}