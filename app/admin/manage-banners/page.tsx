import React from "react";
import prisma from "@/libs/prismadb";
import ManageBannersClient from "./ManageBannersClient";

export const revalidate = 0;

const ManageBannersPage = async () => {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-4">
      <ManageBannersClient banners={banners} />
    </div>
  );
};

export default ManageBannersPage;

