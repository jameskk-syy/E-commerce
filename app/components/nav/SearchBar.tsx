"use client";

import { useRouter } from "next/navigation";
import queryString from "query-string";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FiSearch, FiArrowRight } from "react-icons/fi";

const SearchBar = () => {
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      searchTerm: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (!data.searchTerm) return router.push("/");
    const url = queryString.stringifyUrl(
      {
        url: "/",
        query: {
          searchTerm: data.searchTerm.trim(),
        },
      },
      {
        skipNull: true,
      }
    );

    router.push(url);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative flex items-center w-full group"
    >
      <div className="absolute left-3.5 text-zinc-400 group-focus-within:text-zinc-900 transition pointer-events-none">
        <FiSearch className="text-sm" />
      </div>

      <input
        autoComplete="off"
        {...register("searchTerm")}
        type="text"
        placeholder="Search phones, laptops, audio..."
        className="
          w-full
          py-2.5
          pl-10
          pr-12
          text-xs
          border
          border-zinc-200
          rounded-full
          bg-zinc-50/80
          hover:bg-zinc-100/60
          focus:bg-white
          text-zinc-900
          placeholder-zinc-400
          focus:border-zinc-900
          focus:ring-2
          focus:ring-zinc-100
          focus:outline-none
          transition-all
          shadow-2xs
        "
      />

      <button
        type="submit"
        aria-label="Search"
        className="
          absolute
          right-1.5
          w-7
          h-7
          rounded-full
          bg-zinc-900
          hover:bg-indigo-600
          text-white
          flex
          items-center
          justify-center
          transition-all
          shadow-2xs
          cursor-pointer
        "
      >
        <FiArrowRight className="text-xs" />
      </button>
    </form>
  );
};

export default SearchBar;
