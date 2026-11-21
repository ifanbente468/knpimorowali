"use server";

import { redirect } from "next/navigation";
import { install, isInstalled } from "@/lib/installer";
import { installSchema } from "@/lib/validation";
import { fail, readString, type ActionState } from "@/lib/form";

export async function installAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (await isInstalled()) {
    return fail("Aplikasi sudah terpasang. Halaman instalasi dikunci.");
  }

  if (readString(formData, "website")) {
    return fail("Permintaan ditolak.");
  }

  const installToken = process.env.INSTALL_TOKEN;
  if (installToken && readString(formData, "installToken") !== installToken) {
    return fail("Token instalasi salah atau kosong.");
  }

  const parsed = installSchema.safeParse({
    siteName: readString(formData, "siteName"),
    adminName: readString(formData, "adminName"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    confirmPassword: readString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return fail("Periksa kembali data instalasi.", parsed.error);
  }

  try {
    await install({
      siteName: parsed.data.siteName,
      adminName: parsed.data.adminName,
      adminEmail: parsed.data.email,
      adminPassword: parsed.data.password,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Instalasi gagal dijalankan.");
  }

  redirect("/masuk?installed=1");
}
