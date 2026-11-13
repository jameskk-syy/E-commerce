"use client";

import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";
import SelectColors from "@/app/components/SelectColors";
import CategoryInput from "@/app/components/inputs/CategoryInput";
import CustomCheckBox from "@/app/components/inputs/CustomCheckBox";
import Input from "@/app/components/inputs/Input";
import TextArea from "@/app/components/inputs/TextArea";
import { Categories } from "@/utils/Categories";
import { colors } from "@/utils/Colors";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export type ImageType = {
  color: string;
  colorCode: string;
  image: File | null;
};

export type UploadImageType = {
  color: string;
  colorCode: string;
  image: string; // Base64 data URL
};

// Convert File object to Base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const AddProductForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageType[] | null>(null);
  const [isProductCreated, setIsProductCreated] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "",
      inStock: true,
      stockQuantity: 10,
      images: [],
      price: "",
    },
  });

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [setValue]);

  useEffect(() => {
    setCustomValue("images", images);
  }, [images, setCustomValue]);

  useEffect(() => {
    if (isProductCreated) {
      reset();
      setImages(null);
      setIsProductCreated(false);
    }
  }, [isProductCreated, reset]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!data.category) {
      return toast.error("Please select a category");
    }

    if (!images || images.length === 0) {
      return toast.error("Please upload an image for at least one color");
    }

    setLoading(true);
    toast("Encoding images to Base64 and saving product...", { icon: "⏳" });

    try {
      // Convert all selected color image files to Base64
      const uploadedImages: UploadImageType[] = [];

      for (const item of images) {
        if (item.image) {
          if (typeof item.image === "string") {
            uploadedImages.push({
              color: item.color,
              colorCode: item.colorCode,
              image: item.image,
            });
          } else {
            const base64Data = await fileToBase64(item.image);
            uploadedImages.push({
              color: item.color,
              colorCode: item.colorCode,
              image: base64Data,
            });
          }
        }
      }

      if (uploadedImages.length === 0) {
        setLoading(false);
        return toast.error("Please upload at least one valid image file");
      }

      const productPayload = {
        ...data,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity || "10"),
        images: uploadedImages,
      };

      await axios.post("/api/product", productPayload);

      toast.success("Product created successfully!");
      setIsProductCreated(true);
      router.refresh();
      router.push("/admin/manage-products");
    } catch (err: any) {
      console.error("Product creation error:", err);
      toast.error(err?.response?.data?.error || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const category = watch("category");

  const addImageToState = useCallback((value: ImageType) => {
    setImages((prev) => {
      if (!prev) return [value];
      return [...prev, value];
    });
  }, []);

  const removeImageFromState = useCallback((value: ImageType) => {
    setImages((prev) => {
      if (prev) {
        return prev.filter((item) => item.color !== value.color);
      }
      return prev;
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-6">
      <div>
        <Heading title="Add a New Product" />
        <p className="text-xs text-zinc-500 mt-1">
          Add new electronic products with Base64 images, dynamic categories, and inventory stock tracking.
        </p>
      </div>

      <Input
        id="name"
        label="Product Name"
        disabled={loading}
        register={register}
        errors={errors}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="price"
          label="Price in KSh (e.g. 15000)"
          type="number"
          disabled={loading}
          register={register}
          errors={errors}
          required
        />
        <Input
          id="stockQuantity"
          label="Initial Stock Quantity (Units)"
          type="number"
          disabled={loading}
          register={register}
          errors={errors}
          required
        />
      </div>

      <Input
        id="brand"
        label="Brand (e.g. Apple, Logitech)"
        disabled={loading}
        register={register}
        errors={errors}
        required
      />

      <TextArea
        id="description"
        label="Product Description"
        disabled={loading}
        register={register}
        errors={errors}
        required
      />

      <CustomCheckBox
        id="inStock"
        register={register}
        label="Mark as Active & In Stock"
      />

      {/* Select Category */}
      <div className="w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
          Select Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Categories.map((item) => {
            if (item.label === "All") return null;
            return (
              <CategoryInput
                key={item.label}
                onClick={(cat) => setCustomValue("category", cat)}
                selected={category === item.label}
                label={item.label}
                icon={item.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Select Colors & Base64 Images */}
      <div className="w-full flex flex-col gap-3 pt-4 border-t border-zinc-100">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Color Variants & Base64 Images
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select one or more colors and upload image files. They will be encoded into Base64 format automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {colors.map((item, index) => (
            <SelectColors
              key={index}
              item={item}
              addImageToState={addImageToState}
              removeImageFromState={removeImageFromState}
              isProductCreated={isProductCreated}
            />
          ))}
        </div>
      </div>

      <Button
        label={loading ? "Saving Product..." : "Create Product (KSh)"}
        disabled={loading}
        onClick={handleSubmit(onSubmit)}
      />
    </div>
  );
};

export default AddProductForm;
