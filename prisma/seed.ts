import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const withDemo = process.env.SEED_DEMO
  ? process.env.SEED_DEMO === "true"
  : process.env.NODE_ENV !== "production";

function daysFromNow(days: number, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@knpi-morowali.or.id";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin#KNPI2026";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrator KNPI Morowali";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: "ADMIN", isActive: true },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      phone: "+62 812 0000 0000",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@knpi-morowali.or.id" },
    update: { role: "EDITOR" },
    create: {
      email: "editor@knpi-morowali.or.id",
      name: "Editor Media KNPI Morowali",
      passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12),
      role: "EDITOR",
    },
  });

  const settings: Record<string, string> = {
    site_name: "KNPI Morowali",
    site_tagline: "Pemuda Morowali Bergerak, Berkarya, Berdaya.",
    contact_email: "sekretariat@knpi-morowali.or.id",
    contact_phone: "+62 461 000 000",
    address: "Sekretariat DPD KNPI Kabupaten Morowali, Bungku Tengah, Sulawesi Tengah",
    chairman_name: "H. Abdul Rahman, S.Pd., M.Si.",
    chairman_title: "Ketua DPD KNPI Kabupaten Morowali",
    chairman_message:
      "KNPI Morowali hadir sebagai rumah bersama pemuda. Mari bersinergi, berkarya nyata, dan memberi dampak bagi masyarakat Morowali.",
    instagram: "https://instagram.com/knpimorowali",
    facebook: "https://facebook.com/knpimorowali",
    youtube: "https://youtube.com/@knpimorowali",
    map_url: "https://maps.google.com/?q=Morowali",
    hero_image: "/images/hero.jpg",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const organizations = [
    {
      name: "DPD KNPI Kabupaten Morowali",
      type: "DPD" as const,
      leader: "H. Abdul Rahman, S.Pd., M.Si.",
      description:
        "Dewan Pengurus Daerah KNPI Kabupaten Morowali, periode 2024–2028.",
      sortOrder: 0,
    },
    {
      name: "Pemuda Pancasila",
      type: "OKP" as const,
      leader: "Irfan Saputra",
      description: "Organisasi kepemudaan berbasis nasionalisme dan bela negara.",
      sortOrder: 1,
    },
    {
      name: "Ansor Morowali",
      type: "OKP" as const,
      leader: "Muh. Fajar",
      description: "Barisan Ansor Serbaguna Nahdlatul Ulama Kabupaten Morowali.",
      sortOrder: 2,
    },
    {
      name: "Pemuda Muhammadiyah",
      type: "OKP" as const,
      leader: "Rizky Pratama",
      description: "Kader muda Muhammadiyah untuk dakwah dan pemberdayaan.",
      sortOrder: 3,
    },
    {
      name: "HMI Morowali",
      type: "OKP" as const,
      leader: "Andi Wijaya",
      description: "Himpunan Mahasiswa Islam cabang Morowali.",
      sortOrder: 4,
    },
    {
      name: "PMII Morowali",
      type: "OKP" as const,
      leader: "Nurul Hidayah",
      description: "Pergerakan Mahasiswa Islam Indonesia cabang Morowali.",
      sortOrder: 5,
    },
    {
      name: "KNPI Morowali Muda",
      type: "SAYAP" as const,
      leader: "Fauzan Akbar",
      description: "Sayap kepemudaan untuk kaderisasi dan kegiatan sosial.",
      sortOrder: 6,
    },
  ];

  for (const organization of organizations) {
    await prisma.organization.upsert({
      where: { name: organization.name },
      update: organization,
      create: organization,
    });
  }

  const newsSeed = [
    {
      slug: "knpi-morowali-gelar-pelatihan-kepemimpinan-pemuda",
      title: "KNPI Morowali Gelar Pelatihan Kepemimpinan Pemuda 2026",
      excerpt:
        "Sebanyak 120 pemuda dari 11 kecamatan mengikuti pelatihan kepemimpinan dan literasi digital di Bungku Tengah.",
      category: "KEGIATAN",
      coverImage: "/images/hero.jpg",
      content:
        "DPD KNPI Kabupaten Morowali menggelar Pelatihan Kepemimpinan Pemuda 2026 selama dua hari di Bungku Tengah.\n\nKegiatan ini diikuti 120 peserta dari 11 kecamatan dan menghadirkan fasilitator dari akademisi serta praktisi organisasi kepemudaan.\n\nKetua DPD KNPI Morowali menegaskan bahwa kaderisasi harus berjalan berkelanjutan agar pemuda Morowali siap mengambil peran strategis di masyarakat.\n\nPelatihan mencakup materi kepemimpinan, manajemen organisasi, literasi digital, dan penyusunan program kerja berbasis kebutuhan daerah.",
    },
    {
      slug: "sinergi-okp-morowali-perkuat-program-pemberdayaan",
      title: "Sinergi OKP Morowali Perkuat Program Pemberdayaan",
      excerpt:
        "Forum OKP Morowali menyepakati peta jalan kolaborasi untuk program ekonomi kreatif dan relawan sosial.",
      category: "ORGANISASI",
      coverImage: "/images/hero.jpg",
      content:
        "Organisasi kepemudaan di Kabupaten Morowali menyepakati peta jalan kolaborasi lintas OKP dalam forum koordinasi yang digelar di Sekretariat KNPI Morowali.\n\nKesepakatan mencakup penguatan ekonomi kreatif, pelatihan keterampilan kerja, dan pembentukan tim relawan sosial siaga bencana.\n\nForum ini akan berjalan dalam siklus triwulanan dengan evaluasi bersama.",
    },
    {
      slug: "pernyataan-knpi-morowali-soal-pendidikan-vokasi",
      title: "Pernyataan KNPI Morowali soal Penguatan Pendidikan Vokasi",
      excerpt:
        "KNPI Morowali mendorong kolaborasi sekolah vokasi dengan dunia usaha untuk menekan pengangguran muda.",
      category: "PERNYATAAN",
      coverImage: "/images/hero.jpg",
      content:
        "KNPI Kabupaten Morowali mendesak penguatan pendidikan vokasi yang selaras dengan kebutuhan dunia usaha di Morowali.\n\nPemuda membutuhkan jalur keterampilan yang relevan, akses magang bermutu, dan pendampingan karier.\n\nKNPI menawarkan diri sebagai mitra dalam menghubungkan lembaga pendidikan, perusahaan, dan komunitas pemuda.",
    },
    {
      slug: "tim-pemuda-morowali-raih-juara-turnamen-futsal",
      title: "Tim Pemuda Morowali Raih Juara Turnamen Futsal Sulteng",
      excerpt:
        "Tim KNPI Morowali menorehkan prestasi membanggakan pada turnamen futsal antarkabupaten.",
      category: "PRESTASI",
      coverImage: "/images/hero.jpg",
      content:
        "Tim futsal binaan KNPI Morowali berhasil meraih juara pertama pada turnamen futsal antarkabupaten di Sulawesi Tengah.\n\nKemenangan ini menjadi hasil pembinaan rutin melalui liga pemuda desa yang digagas DPD KNPI Morowali.",
    },
  ];

  if (withDemo)
  for (const [index, item] of newsSeed.entries()) {
    const publishedAt = daysFromNow(-(index + 1), 10);
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...item,
        status: "PUBLISHED",
        publishedAt,
        authorId: admin.id,
        createdAt: publishedAt,
      },
    });
  }

  const agendaSeed = [
    {
      slug: "musyawarah-daerah-knpi-morowali",
      title: "Musyawarah Daerah KNPI Morowali",
      description:
        "Musda ke-IX DPD KNPI Kabupaten Morowali: evaluasi program dan pemilihan pengurus periode berikutnya.",
      location: "Gedung Serbaguna Bungku Tengah",
      days: 7,
      capacity: 200,
    },
    {
      slug: "pelatihan-literasi-digital-pemuda",
      title: "Pelatihan Literasi Digital untuk Pemuda",
      description:
        "Pelatihan wajib bagi pengurus OKP: keamanan digital, konten kreatif, dan organisasi modern.",
      location: "Sekretariat KNPI Morowali",
      days: 14,
      capacity: 80,
    },
    {
      slug: "bakti-sosial-pemuda-pesisir",
      title: "Bakti Sosial Pemuda Pesisir",
      description:
        "Aksi sosial bersama OKP dan relawan untuk masyarakat pesisir Bungku Pesisir.",
      location: "Bungku Pesisir",
      days: 28,
      capacity: 150,
    },
  ];

  if (withDemo)
  for (const item of agendaSeed) {
    const startsAt = daysFromNow(item.days, 9);
    await prisma.agenda.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        location: item.location,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 4 * 60 * 60 * 1000),
        capacity: item.capacity,
        status: "SCHEDULED",
        isPublished: true,
        createdById: editor.id,
      },
    });
  }

  const galleryCount = await prisma.galleryItem.count();
  if (withDemo && galleryCount === 0) {
    const albums = ["Kegiatan", "Kaderisasi", "Sosial"];
    for (let index = 0; index < 6; index += 1) {
      await prisma.galleryItem.create({
        data: {
          title: `Dokumentasi kegiatan pemuda #${index + 1}`,
          album: albums[index % albums.length],
          imageUrl: "/images/hero.jpg",
          caption: "Dokumentasi kegiatan DPD KNPI Kabupaten Morowali.",
          sortOrder: index,
          createdById: editor.id,
        },
      });
    }
  }

  const demoMembers = [
    {
      email: "demo.aktif@example.invalid",
      name: "Nur Aisyah",
      nik: "7201000000000001",
      district: "Bungku Tengah",
      okp: "PMII Morowali",
      status: "ACTIVE" as const,
      memberNo: `KNPI-MOR-${new Date().getFullYear()}-00001`,
    },
    {
      email: "demo.pending@example.invalid",
      name: "Muh. Ridwan",
      nik: "7201000000000002",
      district: "Bahodopi",
      okp: "Pemuda Pancasila",
      status: "PENDING" as const,
      memberNo: null,
    },
    {
      email: "demo.pending2@example.invalid",
      name: "Sri Wahyuni",
      nik: "7201000000000003",
      district: "Menui Kepulauan",
      okp: "HMI Morowali",
      status: "PENDING" as const,
      memberNo: null,
    },
  ];

  if (withDemo)
  for (const demo of demoMembers) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        name: demo.name,
        passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12),
        role: "MEMBER",
        phone: "+62 812 0000 0000",
      },
    });

    await prisma.member.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        memberNo: demo.memberNo,
        nik: demo.nik,
        birthDate: new Date("2000-05-12"),
        gender: "Perempuan",
        address: "Desa Bahomohoni, Kecamatan Bungku Tengah",
        district: demo.district,
        okp: demo.okp,
        occupation: "Mahasiswa",
        status: demo.status,
        verifiedAt: demo.status === "ACTIVE" ? daysFromNow(-20) : null,
        verifiedById: demo.status === "ACTIVE" ? admin.id : null,
        cardIssuedAt: demo.status === "ACTIVE" ? daysFromNow(-20) : null,
      },
    });
  }

  const aspirationCount = await prisma.aspiration.count();
  if (withDemo && aspirationCount === 0) {
    await prisma.aspiration.createMany({
      data: [
        {
          trackingCode: "ASP-2026-0001",
          name: "Komunitas Pemuda Bahodopi",
          email: "pemuda.bahodopi@example.invalid",
          phone: "+62 812 1111 2222",
          category: "Olahraga",
          subject: "Usulan liga futsal antar kecamatan",
          message:
            "Kami mengusulkan liga futsal antar kecamatan sebagai wadah pembinaan atlet muda dan pencegahan kenakalan remaja.",
          status: "IN_PROGRESS",
          isPublic: true,
        },
        {
          trackingCode: "ASP-2026-0002",
          name: "Pemuda Bungku Pesisir",
          email: "pemuda.pesisir@example.invalid",
          category: "Ekonomi Kreatif",
          subject: "Pelatihan pemasaran digital produk nelayan",
          message:
            "Kami berharap ada pelatihan pemasaran digital untuk produk olahan hasil laut di Bungku Pesisir.",
          status: "NEW",
          isPublic: false,
        },
      ],
    });
  }

  const financeCount = await prisma.finance.count();
  if (withDemo && financeCount === 0) {
    await prisma.finance.createMany({
      data: [
        {
          date: daysFromNow(-30),
          type: "INCOME",
          category: "Iuran Anggota",
          description: "Iuran anggota bulan lalu",
          amount: 2500000,
          createdById: admin.id,
        },
        {
          date: daysFromNow(-20),
          type: "EXPENSE",
          category: "Kegiatan",
          description: "Konsumsi rapat koordinasi OKP",
          amount: 1250000,
          createdById: admin.id,
        },
      ],
    });
  }

  const letterCount = await prisma.letter.count();
  if (withDemo && letterCount === 0) {
    await prisma.letter.createMany({
      data: [
        {
          number: "001/DPD-KNPI/MOR/I/2026",
          type: "INCOMING",
          subject: "Undangan Rapat Koordinasi OKP",
          sender: "Kesbangpol Kabupaten Morowali",
          recipient: "DPD KNPI Kabupaten Morowali",
          date: daysFromNow(-5),
          status: "PROCESSED",
          createdById: admin.id,
        },
        {
          number: "002/DPD-KNPI/MOR/I/2026",
          type: "OUTGOING",
          subject: "Permohonan Dukungan Kegiatan Pelatihan Pemuda",
          sender: "DPD KNPI Kabupaten Morowali",
          recipient: "Bupati Morowali",
          date: daysFromNow(-3),
          status: "RECEIVED",
          createdById: admin.id,
        },
      ],
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED",
      entity: "SYSTEM",
      meta: "Data awal aplikasi dimuat",
    },
  });

  console.log(`Seed selesai (konten demo: ${withDemo ? "ya" : "tidak"}).`);
  console.log(`Admin: ${adminEmail}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Password admin awal: ${adminPassword} (segera ganti setelah masuk)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
