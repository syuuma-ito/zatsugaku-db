"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";

const Pagination = ({ className, ...props }) => (
    <nav role="navigation" aria-label="pagination" className={cn("flex w-full justify-center", className)} {...props} />
);

const PaginationContent = ({ className, ...props }) => (
    <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
);

const PaginationItem = ({ className, ...props }) => (
    <li className={cn("", className)} {...props} />
);

const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (
    <Button
        aria-current={isActive ? "page" : undefined}
        variant={isActive ? "default" : "outline"}
        size={size}
        className={cn("", className)}
        {...props}
    />
);

const PaginationPrevious = ({ className, ...props }) => (
    <PaginationLink
        aria-label="Go to previous page"
        size="default"
        className={cn("gap-1 pl-2.5", className)}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
        <span>前のページ</span>
    </PaginationLink>
);

const PaginationNext = ({ className, ...props }) => (
    <PaginationLink
        aria-label="Go to next page"
        size="default"
        className={cn("gap-1 pr-2.5", className)}
        {...props}
    >
        <span>次のページ</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
);

const PaginationEllipsis = ({ className, ...props }) => (
    <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
    </span>
);

export {
    Pagination,
    PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious
};

