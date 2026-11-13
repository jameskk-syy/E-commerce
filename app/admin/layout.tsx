import React from "react";
import { getCurrentUser } from "@/actions/getCurrentUser";
import NullData from "../components/NullData";
import AdminClientShell from "./AdminClientShell";

export const metadata = {
  title: "TechHub Admin Portal",
  description: "TechHub Management Dashboard & Analytics",
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 mb-2">Access Denied</h2>
          <p className="text-xs text-zinc-500 mb-6">
            Administrator credentials (role: ADMIN) are required to access this portal. Please sign in with your authorized admin account.
          </p>
          <a
            href="/login"
            className="inline-block py-2.5 px-6 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition"
          >
            Sign in as Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminClientShell currentUser={currentUser}>
      {children}
    </AdminClientShell>
  );
};

export default AdminLayout;
