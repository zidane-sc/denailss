"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type RefObject } from "react";
import {
  customerInfoSchema,
  type CustomerInfoFormValues,
} from "@/features/booking/validators/booking.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StepCustomerInfo({
  value,
  onChange,
  formRef,
}: {
  value: CustomerInfoFormValues | null;
  onChange: (value: CustomerInfoFormValues) => void;
  formRef: RefObject<{ submit: () => Promise<boolean> } | null>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: value ?? { name: "", phone: "", email: "", notes: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    formRef.current = {
      submit: async () => {
        let isValid = false;
        await handleSubmit(
          (data) => {
            onChange(data);
            isValid = true;
          },
          () => {
            isValid = false;
          }
        )();
        return isValid;
      },
    };
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Data Diri</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Kami butuh kontakmu untuk konfirmasi dan pengingat jadwal.
      </p>

      <form className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama lengkap</Label>
          <Input id="name" placeholder="Nama kamu" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Nomor WhatsApp</Label>
          <Input id="phone" placeholder="08123456789" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email (opsional)</Label>
          <Input id="email" placeholder="nama@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Catatan untuk nail artist (opsional)</Label>
          <Textarea
            id="notes"
            placeholder="Contoh: alergi produk tertentu, request warna khusus, dll."
            {...register("notes")}
          />
          {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
        </div>
      </form>
    </div>
  );
}
