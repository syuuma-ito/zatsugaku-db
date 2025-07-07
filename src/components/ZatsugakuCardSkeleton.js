"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ZatsugakuCardSkeleton() {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent>
                <div className="mb-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>

            <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-16" />
            </CardFooter>
        </Card>
    );
}
