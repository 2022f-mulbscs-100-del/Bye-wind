import { useState, useEffect } from "react";
import { toast } from "sonner";
import { postJson, putJson, getJson } from "@/lib/api";
import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";

export default function CommunicationSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { refreshGoLiveStatus } = useGoLiveContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [emailConfig, setEmailConfig] = useState({
    id: "",
    channel: "EMAIL",
    provider: "SendGrid",
    apiKey: "",
    senderId: "",
    isActive: false,
  });

  useEffect(() => {
    const loadComms = async () => {
      try {
        const res = await getJson<{ data: any[] }>("/communication-channels");
        const data = res.data?.data ?? res.data ?? [];
        const email = data.find((d: any) => d.channel === "EMAIL");
        if (email) {
          setEmailConfig({
            id: email.id,
            channel: email.channel,
            provider: email.provider,
            apiKey: email.apiKey,
            senderId: email.senderId,
            isActive: email.isActive,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void loadComms();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailConfig.isActive && (!emailConfig.apiKey || !emailConfig.senderId)) {
      toast.error("API key and Sender Email are required if active.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving communication settings...");

    try {
      if (emailConfig.id) {
        await putJson(`/communication-channels/${emailConfig.id}`, emailConfig);
      } else {
        await postJson("/communication-channels", emailConfig);
      }

      await refreshGoLiveStatus();
      toast.success("Settings saved!", { id: toastId });
      onNext();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Communication Setup</h2>
        <p className="text-sm text-slate-500">
          Configure how you send confirmation emails or SMS to guests from the platform. By default, the platform emails are used, but you can bring your own email provider (e.g. SendGrid).
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emailActive"
                checked={emailConfig.isActive}
                onChange={(e) => setEmailConfig({ ...emailConfig, isActive: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="emailActive" className="text-sm font-medium text-slate-700">
                Use custom SendGrid account
              </label>
            </div>
            {!emailConfig.isActive && (
              <p className="text-xs text-slate-500 ml-8">
                If unchecked, default system emails will be sent out as "no-reply@platform.com"
              </p>
            )}
          </div>

          {emailConfig.isActive && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">SendGrid API Key</label>
                <input
                  required
                  type="password"
                  placeholder="SG...."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={emailConfig.apiKey}
                  onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Verified Sender Email</label>
                <input
                  required
                  type="email"
                  placeholder="hello@yourrestaurant.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={emailConfig.senderId}
                  onChange={(e) => setEmailConfig({ ...emailConfig, senderId: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving}
            className="rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : emailConfig.isActive ? "Save & Continue" : "Skip & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
