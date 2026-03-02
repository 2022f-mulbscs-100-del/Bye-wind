import { useParams } from "react-router-dom";
import { FiMail, FiPhone, FiUserCheck } from "react-icons/fi";

const staffProfiles = [
  {
    id: "s1",
    name: "Ava Collins",
    role: "General Manager",
    availability: "Full-time",
    location: "Downtown",
    phone: "(415) 555-2033",
    email: "ava.collins@byewind.com",
    bio: "Leads daily operations and guest experience strategy.",
    certifications: ["Food Safety", "Leadership"],
  },
  {
    id: "s2",
    name: "Liam Patel",
    role: "Head Chef",
    availability: "Full-time",
    location: "Uptown",
    phone: "(415) 555-8192",
    email: "liam.patel@byewind.com",
    bio: "Specializes in seasonal menu development and kitchen ops.",
    certifications: ["ServSafe", "Culinary Management"],
  },
  {
    id: "s3",
    name: "Maya Brooks",
    role: "Floor Manager",
    availability: "Part-time",
    location: "Marina",
    phone: "(415) 555-7788",
    email: "maya.brooks@byewind.com",
    bio: "Coordinates floor flow and guest seating logistics.",
    certifications: ["Hospitality"],
  },
  {
    id: "s4",
    name: "Noah Patel",
    role: "Server",
    availability: "Weekends",
    location: "Downtown",
    phone: "(415) 555-1122",
    email: "noah.patel@byewind.com",
    bio: "Focused on VIP guest service and upselling.",
    certifications: ["Customer Service"],
  },
];

const StaffProfile = () => {
  const { id } = useParams();
  const staff = staffProfiles.find((item) => item.id === id);

  if (!staff) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Staff not found</div>
        <p className="mt-2 text-sm text-slate-500">
          This staff profile does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FiUserCheck className="text-xl" />
          </div>
          <div>
            <div className="text-xl font-semibold text-slate-900">
              {staff.name}
            </div>
            <div className="text-sm text-slate-500">{staff.role}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Details</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>Availability: {staff.availability}</div>
            <div>Location: {staff.location}</div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-slate-400" /> {staff.phone}
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-slate-400" /> {staff.email}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Bio</div>
          <p className="mt-3 text-sm text-slate-500">{staff.bio}</p>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase text-slate-400">
              Certifications
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {staff.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
