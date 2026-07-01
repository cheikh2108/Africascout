import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">Paramètres du compte</h1>
        <UserProfile
          appearance={{
            variables: {
              colorBackground: "#111111",
              colorPrimary:    "#00A651",
              colorDanger:     "#ef4444",
              borderRadius:    "0.75rem",
            },
            elements: {
              card:              "shadow-none border border-gray-800",
              formButtonPrimary: "bg-[#00A651] hover:bg-green-600",
            },
          }}
        />
      </div>
    </div>
  );
}
