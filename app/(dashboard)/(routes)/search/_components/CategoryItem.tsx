"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconType } from "react-icons";
import qs from "query-string"


interface CategoryItemProps {
    label: string;
    value?: string;
    icon?: IconType;
  };


export const CategoryItem = ({
    label,
    value,
    icon: Icon,
  }: CategoryItemProps) => {

    const pathname = usePathname();
    const router = useRouter();
    const searchParams= useSearchParams();
    const currentCategoryId = searchParams.get('categoryId');
    const currentTitle = searchParams.get('title');
    const isSelected = currentCategoryId === value;

    const onClick = ()=>{
        const url = qs.stringifyUrl({
            url:pathname,
            query:{
                title:currentTitle,
                categoryId: isSelected ? null : value
            }
        },{skipNull:true,skipEmptyString:true});

        router.push(url)
    }




  return (
    <button className={cn(
  "py-2 px-3 text-sm border rounded-full flex items-center gap-x-1 transition hover:border-sky-700",
  "border-slate-200 dark:border-slate-600", // adapt default border color
  isSelected &&
    "border-sky-700 bg-sky-200/20 text-sky-800 dark:bg-transparent dark:text-sky-400 dark:border-sky-500"
)}

        type="button"
        onClick={onClick}
        > 
    {Icon && <Icon size={20}/>}
    <div className="trancate">
        {label}
    </div>
    </button>
  )
}
