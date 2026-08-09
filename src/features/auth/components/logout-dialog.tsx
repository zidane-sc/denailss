"use client";

import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LogoutDialog({ mobile = false }: { mobile?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={mobile ? "icon" : "sm"}
            className={mobile ? "text-muted-foreground hover:text-foreground" : "w-full justify-start gap-2 text-muted-foreground hover:text-foreground"}
            aria-label={mobile ? "Keluar dari akun" : undefined}
          />
        }
      >
        <SignOutIcon className="size-4" />
        {!mobile && "Keluar"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keluar dari akun?</DialogTitle>
          <DialogDescription>
            Kamu perlu masuk kembali untuk membuka portal Denailss.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Batal
          </DialogClose>
          <form action="/auth/signout" method="post">
            <Button type="submit" className="w-full sm:w-auto">
              Keluar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
