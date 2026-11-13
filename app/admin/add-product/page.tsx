import React from "react";
import AddProductForm from "./AddProductForm";
import { getCurrentUser } from "@/actions/getCurrentUser";
import NullData from "@/app/components/NullData";

const AddProduct = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <NullData title="Oops! Access Denied" />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-10 shadow-xs">
        <AddProductForm />
      </div>
    </div>
  );
};

export default AddProduct;
