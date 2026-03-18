const STORAGE_KEYS = {
  token: "auth_token",
  isAuthenticated: "isAuthenticated",
  email: "auth_email",
  role: "auth_role",
  name: "auth_name",
  user: "auth_user",
  restaurantId: "auth_restaurant_id",
  userId: "auth_user_id",
};

export type BackendRole = "SUPER_ADMIN" | "OWNER" | "HOST" | "STAFF";
export type BrowserRole = "admin" | "super-admin" | "user";

export type StaffSummary = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: BackendRole;
  restaurantId?: string | null;
};

const roleMap: Record<BackendRole, BrowserRole> = {
  SUPER_ADMIN: "super-admin",
  OWNER: "admin",
  HOST: "admin",
  STAFF: "admin",
};

const getStorage = () => (typeof window === "undefined" ? null : window.localStorage);

const formatName = (firstName?: string | null, lastName?: string | null) => {
  const parts = [];
  if (firstName?.trim()) parts.push(firstName.trim());
  if (lastName?.trim()) parts.push(lastName.trim());
  return parts.join(" ") || "";
};

export const mapBackendRoleToBrowserRole = (role?: BackendRole | null): BrowserRole => {
  if (!role) return "user";
  return roleMap[role] ?? "user";
};

export const persistAuthSession = (token: string, staff: StaffSummary) => {
  const storage = getStorage();
  if (!storage) return;

  const uiRole = mapBackendRoleToBrowserRole(staff.role);
  const fullName = formatName(staff.firstName, staff.lastName);

  storage.setItem(STORAGE_KEYS.token, token);
  storage.setItem(STORAGE_KEYS.isAuthenticated, "true");
  storage.setItem(STORAGE_KEYS.email, staff.email);
  storage.setItem(STORAGE_KEYS.role, uiRole);
  storage.setItem(STORAGE_KEYS.name, fullName);
  storage.setItem(
    STORAGE_KEYS.user,
    JSON.stringify({ email: staff.email, name: fullName, role: uiRole })
  );
  storage.setItem(STORAGE_KEYS.userId, staff.id);

  if (staff.restaurantId) {
    storage.setItem(STORAGE_KEYS.restaurantId, staff.restaurantId);
  } else {
    storage.removeItem(STORAGE_KEYS.restaurantId);
  }
};

export const clearAuthSession = () => {
  const storage = getStorage();
  if (!storage) return;
  Object.values(STORAGE_KEYS).forEach((key) => storage.removeItem(key));
};

export const getStoredToken = () => {
  const storage = getStorage();
  return storage?.getItem(STORAGE_KEYS.token) ?? null;
};

export const isSessionActive = () => Boolean(getStoredToken());

export const getStoredRole = (): BrowserRole | null => {
  const storage = getStorage();
  if (!storage) return null;
  const role = storage.getItem(STORAGE_KEYS.role);
  if (!role) return null;
  return role as BrowserRole;
};

export const getStoredUser = () => {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { email: string; name: string; role: BrowserRole };
  } catch {
    storage.removeItem(STORAGE_KEYS.user);
    return null;
  }
};

export const getStoredRestaurantId = () => {
  const storage = getStorage();
  return storage?.getItem(STORAGE_KEYS.restaurantId) ?? null;
};

export const getStoredUserId = () => {
  const storage = getStorage();
  return storage?.getItem(STORAGE_KEYS.userId) ?? null;
};
