import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-xl font-bold text-[var(--ink)] mb-6">Paramètres du compte</h1>
        <UserProfile
          appearance={{
            variables: {
              colorBackground: "#111111",
              colorPrimary:    "#00A651",
              colorDanger:     "#ef4444",
              borderRadius:    "0.75rem",
            },
            elements: {
              card:              "shadow-none",
              rootBox:           "w-full",
              cardBox:           "w-full shadow-none border border-[#1F2937] rounded-2xl",
              formButtonPrimary: "bg-[#00A651] hover:bg-green-600",
            },
          }}
        />
      </div>
    </div>
  );
}
