import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { updateSettingsAction } from "@/actions/admin";
import { ActionForm } from "@/components/action-form";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <PageHeader title="Pengaturan situs" description="Identitas, kontak, dan konten utama situs publik." />

      <ActionForm action={updateSettingsAction} submitLabel="Simpan pengaturan" className="surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="site_name" className="label">Nama situs</label>
            <input id="site_name" name="site_name" className="input" defaultValue={settings.siteName} required maxLength={120} />
          </div>
          <div>
            <label htmlFor="site_tagline" className="label">Tagline / headline</label>
            <input id="site_tagline" name="site_tagline" className="input" defaultValue={settings.tagline} maxLength={160} />
          </div>
          <div>
            <label htmlFor="contact_email" className="label">Email kontak</label>
            <input id="contact_email" name="contact_email" type="email" className="input" defaultValue={settings.email} maxLength={160} />
          </div>
          <div>
            <label htmlFor="contact_phone" className="label">Telepon</label>
            <input id="contact_phone" name="contact_phone" className="input" defaultValue={settings.phone} maxLength={30} />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="label">Alamat sekretariat</label>
          <textarea id="address" name="address" className="textarea min-h-20" defaultValue={settings.address} maxLength={300} />
        </div>
        <div>
          <label htmlFor="map_url" className="label">Tautan peta</label>
          <input id="map_url" name="map_url" className="input" defaultValue={settings.mapUrl} maxLength={500} />
        </div>

        <div className="border-t border-line pt-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Sambutan ketua</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="chairman_name" className="label">Nama ketua</label>
              <input id="chairman_name" name="chairman_name" className="input" defaultValue={settings.chairmanName} maxLength={140} />
            </div>
            <div>
              <label htmlFor="chairman_title" className="label">Jabatan</label>
              <input id="chairman_title" name="chairman_title" className="input" defaultValue={settings.chairmanTitle} maxLength={160} />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="chairman_message" className="label">Pesan sambutan</label>
            <textarea id="chairman_message" name="chairman_message" className="textarea" defaultValue={settings.chairmanMessage} maxLength={2000} />
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Media sosial</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="instagram" className="label">Instagram</label>
              <input id="instagram" name="instagram" className="input" defaultValue={settings.instagram} maxLength={500} />
            </div>
            <div>
              <label htmlFor="facebook" className="label">Facebook</label>
              <input id="facebook" name="facebook" className="input" defaultValue={settings.facebook} maxLength={500} />
            </div>
            <div>
              <label htmlFor="youtube" className="label">YouTube</label>
              <input id="youtube" name="youtube" className="input" defaultValue={settings.youtube} maxLength={500} />
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <ImageUpload name="hero_image" initialValue={settings.heroImage} label="Foto hero beranda" hint="JPG, PNG, atau WebP. Maksimal 5 MB." />
        </div>
      </ActionForm>

      <div className="surface mt-6 p-6 text-sm text-muted">
        <h2 className="font-bold text-navy">Catatan operasional</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6">
          <li>Email pengaturan tidak mengirim email otomatis; integrasi SMTP dapat ditambahkan.</li>
          <li>Unggahan gambar disimpan pada folder <code className="font-mono">UPLOAD_DIR</code>. Gunakan volume persisten saat produksi.</li>
          <li>Untuk keamanan, ganti kata sandi administrator awal setelah login pertama.</li>
        </ul>
      </div>
    </div>
  );
}
