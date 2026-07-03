import "dotenv/config";
import { randomBytes, scryptSync } from "crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

const decisions = [
  {
    id: "1",
    number: "2026/142",
    title: "تنظيم حركة النقل العام في وسط مدينة دمشق",
    summary:
      "قرار يقضي بإعادة تنظيم خطوط النقل الداخلي وتحديد مواقف مخصصة للحافلات في المنطقة المركزية بهدف تخفيف الازدحام المروري.",
    fullText:
      "بناءً على أحكام قانون الإدارة المحلية، وعلى ما تقتضيه المصلحة العامة، تقرر إعادة تنظيم حركة النقل العام في وسط مدينة دمشق وفق ما يلي:\n\nأولاً: تحديد مسارات ثابتة لخطوط الحافلات داخل المنطقة المركزية مع إلزام الناقلين بالالتزام بها.\n\nثانياً: استحداث مواقف مخصصة للحافلات في النقاط المحددة من قبل مديرية النقل.\n\nثالثاً: منع الوقوف العشوائي في الشوارع الرئيسية خلال ساعات الذروة.\n\nرابعاً: يُعمل بهذا القرار اعتباراً من تاريخ صدوره، وعلى الجهات المعنية كل فيما يخصه تنفيذه.",
    category: "نقل",
    governorate: "محافظة دمشق",
    directorate: "مديرية المنطقة الأولى",
    area: "القنوات",
    date: "2026-06-10",
    pdfUrl: "/files/decisions/decision-2026-142.pdf",
    status: "published",
    createdAt: new Date("2026-06-10T09:00:00.000Z"),
  },
  {
    id: "2",
    number: "2026/138",
    title: "إعادة تأهيل البنى التحتية في حي القابون",
    summary:
      "اعتماد خطة لإعادة تأهيل شبكات المياه والصرف الصحي والطرقات في حي القابون ضمن برنامج إعادة الإعمار للمدينة.",
    fullText:
      "تقرر اعتماد خطة إعادة تأهيل البنى التحتية في حي القابون وفق المراحل التالية:\n\nأولاً: إعادة تأهيل شبكة مياه الشرب واستبدال الأقسام المتضررة.\n\nثانياً: إصلاح شبكة الصرف الصحي ومعالجة نقاط الفيضان المتكررة.\n\nثالثاً: تعبيد الطرقات الرئيسية والفرعية ضمن الحي.\n\nرابعاً: تكليف مديرية الخدمات الفنية بمتابعة التنفيذ ورفع تقارير دورية.",
    category: "إعمار",
    governorate: "محافظة دمشق",
    directorate: "مديرية برزة",
    area: "القابون",
    date: "2026-05-28",
    pdfUrl: "/files/decisions/decision-2026-138.pdf",
    status: "published",
    createdAt: new Date("2026-05-28T08:30:00.000Z"),
  },
  {
    id: "3",
    number: "2026/131",
    title: "تعزيز الخدمات الطبية في المراكز الصحية البلدية",
    summary:
      "قرار بزيادة الكوادر الطبية وتوسيع ساعات العمل في المراكز الصحية التابعة للمحافظة لتحسين تقديم الرعاية الأولية.",
    fullText:
      "بهدف تحسين مستوى الرعاية الصحية الأولية المقدمة للمواطنين، تقرر ما يلي:\n\nأولاً: زيادة عدد الكوادر الطبية والتمريضية في المراكز الصحية البلدية.\n\nثانياً: تمديد ساعات العمل في المراكز ذات الكثافة السكانية العالية.\n\nثالثاً: تأمين المستلزمات والأدوية الأساسية بشكل دوري.\n\nرابعاً: تكليف مديرية الصحة بالإشراف والمتابعة.",
    category: "صحة",
    governorate: "محافظة دمشق",
    directorate: "مديرية المزة",
    area: "المزة",
    date: "2026-05-15",
    pdfUrl: "/files/decisions/decision-2026-131.pdf",
    status: "published",
    createdAt: new Date("2026-05-15T10:15:00.000Z"),
  },
  {
    id: "4",
    number: "2026/124",
    title: "تنظيم عمل الأسواق الشعبية وتراخيص الباعة",
    summary:
      "تنظيم أوقات ومواقع الأسواق الشعبية في المدينة ومنح تراخيص موحدة للباعة بما يضمن النظافة والسلامة العامة.",
    fullText:
      "تنظيماً لعمل الأسواق الشعبية في مدينة دمشق، تقرر ما يلي:\n\nأولاً: تحديد المواقع المرخصة لإقامة الأسواق الشعبية.\n\nثانياً: منح تراخيص موحدة للباعة ضمن هذه الأسواق.\n\nثالثاً: إلزام الباعة بمعايير النظافة والسلامة العامة.\n\nرابعاً: تكليف الوحدات الإدارية بمتابعة التنفيذ.",
    category: "خدمات",
    governorate: "محافظة دمشق",
    directorate: "مديرية الميدان",
    area: "الميدان",
    date: "2026-04-30",
    pdfUrl: "/files/decisions/decision-2026-124.pdf",
    status: "published",
    createdAt: new Date("2026-04-30T11:45:00.000Z"),
  },
  {
    id: "5",
    number: "2026/118",
    title: "دعم المدارس الحكومية وتأهيل الأبنية المدرسية",
    summary:
      "اعتماد خطة لترميم الأبنية المدرسية المتضررة وتزويد المدارس الحكومية بالتجهيزات اللازمة قبل بدء العام الدراسي.",
    fullText:
      "بهدف تهيئة بيئة تعليمية مناسبة، تقرر ما يلي:\n\nأولاً: ترميم الأبنية المدرسية المتضررة ضمن أحياء المدينة.\n\nثانياً: تزويد المدارس بالتجهيزات والمقاعد اللازمة.\n\nثالثاً: إعطاء الأولوية للمدارس ذات الكثافة الطلابية العالية.\n\nرابعاً: تكليف مديرية التربية بالتنسيق والمتابعة.",
    category: "تعليم",
    governorate: "محافظة دمشق",
    directorate: "مديرية باب توما",
    area: "باب توما",
    date: "2026-04-12",
    pdfUrl: "/files/decisions/decision-2026-118.pdf",
    status: "published",
    createdAt: new Date("2026-04-12T09:20:00.000Z"),
  },
  {
    id: "6",
    number: "2026/109",
    title: "تحسين خدمات جمع النفايات وإدارة المخلفات",
    summary:
      "تطوير آلية جمع النفايات في الأحياء وزيادة عدد الحاويات وتنظيم مواعيد الجمع للحفاظ على النظافة العامة.",
    fullText:
      "حرصاً على نظافة المدينة وصحة المواطنين، تقرر ما يلي:\n\nأولاً: زيادة عدد حاويات النفايات وتوزيعها وفق الكثافة السكانية.\n\nثانياً: تنظيم مواعيد ثابتة لجمع النفايات في كل حي.\n\nثالثاً: تفعيل المراقبة على نقاط التجميع العشوائية.\n\nرابعاً: تكليف مديرية النظافة بالتنفيذ والمتابعة.",
    category: "خدمات",
    governorate: "محافظة دمشق",
    directorate: "مديرية المهاجرين",
    area: "ركن الدين",
    date: "2026-03-25",
    pdfUrl: "/files/decisions/decision-2026-109.pdf",
    status: "published",
    createdAt: new Date("2026-03-25T07:50:00.000Z"),
  },
];

const suggestions = [
  {
    id: "s1",
    decisionId: "1",
    email: "citizen1@example.com",
    body: "نقترح إضافة خط نقل إضافي يربط المنطقة المركزية بالأحياء الجنوبية لتخفيف الضغط.",
    status: "pending",
    createdAt: new Date("2026-06-12T13:00:00.000Z"),
  },
  {
    id: "s2",
    decisionId: "3",
    email: "citizen2@example.com",
    body: "يرجى تخصيص عيادة مسائية للأطفال في المراكز الصحية ذات الكثافة العالية.",
    status: "approved",
    createdAt: new Date("2026-05-18T15:30:00.000Z"),
  },
  {
    id: "s3",
    decisionId: "2",
    email: "citizen3@example.com",
    body: "نأمل إعطاء الأولوية لإصلاح شبكة الصرف الصحي قبل تعبيد الطرقات لتجنب إعادة الحفر.",
    status: "pending",
    createdAt: new Date("2026-05-30T10:10:00.000Z"),
  },
];

async function main() {
  // Reset so re-seeding is idempotent (suggestions first for FK integrity).
  await prisma.suggestion.deleteMany();
  await prisma.decision.deleteMany();

  for (const decision of decisions) {
    await prisma.decision.create({ data: decision });
  }

  for (const suggestion of suggestions) {
    await prisma.suggestion.create({ data: suggestion });
  }

  // Seed the initial admin from env vars (defaults: admin / damascus2026).
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "damascus2026";
  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
    },
  });

  console.log(
    `Seeded ${decisions.length} decisions, ${suggestions.length} suggestions, and admin "${adminUsername}".`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
