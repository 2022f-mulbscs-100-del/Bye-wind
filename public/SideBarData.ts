export interface SidebarItem {
  name: string;
  path?: string;
  children?: SidebarItem[];
}

export const AdminMasterLevel: SidebarItem[] = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Restaurant Settings", path: "/dashboard/restaurant-settings" },
  { name: "Branches Managment", path: "/dashboard/branches" },
  { name: "Menu Management", path: "/dashboard/menu" },
  { name: "Staff Managment", path: "/dashboard/staff" },
  { name: "Payment", path: "/dashboard/payment" },
  { name: "Analytics", path: "/dashboard/analytics" },
  { name: "Orders", path: "/dashboard/orders" },
  { name: "Guest CRM", path: "/dashboard/guest-crm" },
  { name: "Settings", path: "/dashboard/settings" },
];

export const AdminBranchLevel: SidebarItem[] = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Staff Managment", path: "/dashboard/staff" },
  { name: "Menu Management", path: "/dashboard/menu" },
  { name: "Reservation", path: "/dashboard/reservation" },
  { name: "Orders", path: "/dashboard/orders" },
  { name: "Guest CRM", path: "/dashboard/guest-crm" },
  { name: "Onboarding", path: "/dashboard/onboarding" },
  { 
    name: "Settings", 
    children: [
      { name: "Business Hours", path: "/dashboard/business-hours" },
      { name: "Reservation Rules", path: "/dashboard/reservation-policy" },
      { name: "Turn Times", path: "/dashboard/turn-times" },
      { name: "Floor Managment", path: "/dashboard/floor" },
    ]
  },
];

