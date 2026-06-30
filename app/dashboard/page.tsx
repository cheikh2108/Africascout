import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  // Si l'utilisateur n'a pas encore fait l'onboarding, on le redirige
  if (!user) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold text-white mb-2">
        Bienvenue, {user.fullName} 👋
      </h1>
      <p className="text-gray-400 mb-1">
        Rôle : <span className="text-[#00A651] font-semibold">{user.role}</span>
      </p>
      <p className="text-gray-600 text-sm mt-4">
        Le tableau de bord complet arrive bientôt...
      </p>
    </div>
  );
}
