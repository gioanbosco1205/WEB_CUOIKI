import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function normalizeDates(obj: any) {
  const dateFields = ["startDate", "endDate", "dueDate", "paymentDate", "applicationDate", "postedDate"];
  for (const field of dateFields) {
    if (obj[field] && typeof obj[field] === "string") {
      obj[field] = new Date(obj[field]);
    }
  }
  return obj;
}

async function insertLocationData(locations: any[]) {
  for (const location of locations) {
    const { id, country, city, state, address, postalCode, latitude, longitude } = location;
    try {
      await prisma.location.create({
        data: {
          id,
          country,
          city,
          state,
          address,
          postalCode,
          latitude,
          longitude,
        },
      });
      console.log(`Inserted location for ${city}`);
    } catch (error) {
      console.error(`Error inserting location for ${city}:`, error);
    }
  }
}

async function resetSequence(modelName: string) {
  const quotedModelName = `"${toPascalCase(modelName)}"`;

  const maxIdResult = await (
    prisma[modelName as keyof PrismaClient] as any
  ).findMany({
    select: { id: true },
    orderBy: { id: "desc" },
    take: 1,
  });

  if (maxIdResult.length === 0) return;

  const nextId = maxIdResult[0].id + 1;
  await prisma.$executeRaw(
    Prisma.sql`SELECT setval(pg_get_serial_sequence(${Prisma.raw("'" + quotedModelName + "'")}, 'id'), coalesce(max(id)+1, ${nextId}), false) FROM ${Prisma.raw(quotedModelName)};`
  );
  console.log(`Reset sequence for ${modelName} to ${nextId}`);
}

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    return toPascalCase(path.basename(fileName, path.extname(fileName)));
  });

  for (const modelName of modelNames.reverse()) {
    const modelNameCamel = toCamelCase(modelName);
    const model = (prisma as any)[modelNameCamel];
    if (!model) {
      console.error(`Model ${modelName} not found in Prisma client`);
      continue;
    }
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "location.json", // No dependencies
    "manager.json", // No dependencies
    "property.json", // Depends on location and manager
    "tenant.json", // No dependencies
    "lease.json", // Depends on property and tenant
    "application.json", // Depends on property and tenant
    "payment.json", // Depends on lease
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = toPascalCase(path.basename(fileName, path.extname(fileName)));
    const modelNameCamel = toCamelCase(modelName);

    const model = (prisma as any)[modelNameCamel];

    try {
      if (modelName === "Location") {
        await insertLocationData(jsonData);
      } else if (modelName === "Payment") {
        // ✅ Xử lý riêng Payment
        for (const item of jsonData) {
          const data = normalizeDates(item);

          // Bổ sung ngày thanh toán nếu thiếu
          if (!data.paymentDate) data.paymentDate = new Date();

          // Dùng leaseId (đơn giản hơn connect)
          await prisma.payment.create({
            data: {
              amountDue: data.amountDue,
              amountPaid: data.amountPaid,
              dueDate: data.dueDate,
              paymentDate: data.paymentDate,
              paymentStatus: data.paymentStatus,
              leaseId: data.leaseId, // ✅ chỉ leaseId thôi
            },
          });
        }
      } else {
        // Các model còn lại
        for (const item of jsonData) {
          const data = normalizeDates(item);
          await model.create({ data });
        }
      }

      console.log(`Seeded ${modelName} with data from ${fileName}`);
      await resetSequence(modelName);
      await sleep(500);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
