import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiEdit2,
  FiMail,
  FiMoreHorizontal,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

type Staff = {
  id: string;
  name: string;
  role: string;
  availability: string;
  location: string;
  phone: string;
  email: string;
};

const initialStaff: Staff[] = [
  {
    id: "s1",
    name: "Ava Collins",
    role: "General Manager",
    availability: "Full-time",
    location: "Downtown",
    phone: "(415) 555-2033",
    email: "ava.collins@byewind.com",
  },
  {
    id: "s2",
    name: "Liam Patel",
    role: "Head Chef",
    availability: "Full-time",
    location: "Uptown",
    phone: "(415) 555-8192",
    email: "liam.patel@byewind.com",
  },
  {
    id: "s3",
    name: "Maya Brooks",
    role: "Floor Manager",
    availability: "Part-time",
    location: "Marina",
    phone: "(415) 555-7788",
    email: "maya.brooks@byewind.com",
  },
  {
    id: "s4",
    name: "Noah Patel",
    role: "Server",
    availability: "Weekends",
    location: "Downtown",
    phone: "(415) 555-1122",
    email: "noah.patel@byewind.com",
  },
];

const emptyStaff: Staff = {
  id: "new",
  name: "",
  role: "",
  availability: "",
  location: "",
  phone: "",
  email: "",
};

const StaffManagment = () => {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const editingStaff = useMemo(() => {
    if (editingId === "new") return emptyStaff;
    return staffList.find((staff) => staff.id === editingId) ?? null;
  }, [editingId, staffList]);

  const handleSave = (next: Staff) => {
    if (editingId === "new") {
      const created = { ...next, id: `s${staffList.length + 1}` };
      setStaffList((prev) => [created, ...prev]);
      setEditingId(null);
      return;
    }

    setStaffList((prev) =>
      prev.map((staff) => (staff.id === next.id ? next : staff))
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setStaffList((prev) => prev.filter((staff) => staff.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Staff
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            Staff Managment
          </div>
          <p className="mt-2 text-sm text-slate-500">
            View staff roles, availability, and profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingId("new")}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <FiPlus />
          Add New Member
        </button>
      </div>

      {editingStaff && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {editingId === "new" ? "New Staff Member" : "Edit Staff Member"}
            </div>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: "Name", key: "name" },
              { label: "Role", key: "role" },
              { label: "Availability", key: "availability" },
              { label: "Location", key: "location" },
              { label: "Phone", key: "phone" },
              { label: "Email", key: "email" },
            ].map((field) => (
              <label
                key={field.key}
                className="space-y-1 text-xs font-semibold text-slate-500"
              >
                {field.label}
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  value={editingStaff[field.key as keyof Staff] as string}
                  onChange={(event) =>
                    setEditingId((prev) => {
                      if (!prev) return prev;
                      handleSave({
                        ...editingStaff,
                        [field.key]: event.target.value,
                      } as Staff);
                      return prev;
                    })
                  }
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(editingStaff)}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Staff</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Availability</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {staffList.map((staff) => (
                <tr key={staff.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <FiUser />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {staff.name}
                        </div>
                        <div className="text-xs text-slate-500">{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium text-slate-700">{staff.role}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <FiCalendar className="text-slate-400" />
                      {staff.availability}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{staff.location}</td>
                  <td className="py-3">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <FiPhone className="text-slate-400" /> {staff.phone}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiMail className="text-slate-400" /> {staff.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="relative inline-flex">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === staff.id ? null : staff.id))
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <FiMoreHorizontal />
                      </button>
                      {openMenuId === staff.id && (
                        <div className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                      <Link
                        to={`/dashboard/staff/${staff.id}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                            View profile
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(staff.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <FiEdit2 />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDelete(staff.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagment;
