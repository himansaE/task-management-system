"use client";

import { useMediaQuery } from "@lib/hooks/use-media-query";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@ui/alert-dialog";
import { Button } from "@ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@ui/drawer";

type TaskDeleteAlertProps = {
    open: boolean;
    taskTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function TaskDeleteAlert({ open, taskTitle, onConfirm, onCancel }: TaskDeleteAlertProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{taskTitle}&rdquo;? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={onConfirm}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onCancel()}>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Delete task</DrawerTitle>
                    <DrawerDescription>
                        Are you sure you want to delete &ldquo;{taskTitle}&rdquo;? This action
                        cannot be undone.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
