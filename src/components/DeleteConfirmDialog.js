"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "削除の確認",
    description = "この操作は取り消すことができません。本当に削除しますか？",
    confirmText = "削除",
    cancelText = "キャンセル",
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
