import { PrismaClient, Role, BranchType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {

  // ─── UNITS (reuse or create) ───────────────────────────────────────────────
  const [pcs, kg, pkt, ltr, gm, box, dzn] = await Promise.all([
    prisma.unit.upsert({ where: { code: 'PCS' }, update: {}, create: { code: 'PCS', name: 'Pieces' } }),
    prisma.unit.upsert({ where: { code: 'KG' },  update: {}, create: { code: 'KG',  name: 'Kilogram' } }),
    prisma.unit.upsert({ where: { code: 'PKT' }, update: {}, create: { code: 'PKT', name: 'Packet' } }),
    prisma.unit.upsert({ where: { code: 'LTR' }, update: {}, create: { code: 'LTR', name: 'Litre' } }),
    prisma.unit.upsert({ where: { code: 'GM' },  update: {}, create: { code: 'GM',  name: 'Gram' } }),
    prisma.unit.upsert({ where: { code: 'BOX' }, update: {}, create: { code: 'BOX', name: 'Box' } }),
    prisma.unit.upsert({ where: { code: 'DZN' }, update: {}, create: { code: 'DZN', name: 'Dozen' } }),
  ]);

  // ─── BRANCHES ─────────────────────────────────────────────────────────────
  console.log('\n📍 Creating branches...');

  const branchData = [
    { code: 'ACE-MAIN',  name: 'Ace Studios - Main Branch',    address: '12 Studio Lane, Downtown',    branch_type: BranchType.BRANCH },
    { code: 'ACE-EAST',  name: 'Ace Studios - East Side',      address: '45 East Avenue, East Town',   branch_type: BranchType.BRANCH },
    { code: 'ACE-WEST',  name: 'Ace Studios - West Wing',      address: '88 West Street, West Plaza',  branch_type: BranchType.BRANCH },
    { code: 'ACE-NORTH', name: 'Ace Studios - North Hub',      address: '3 North Ring Road, Uptown',   branch_type: BranchType.BRANCH },
    { code: 'ACE-WH',    name: 'Ace Studios - Warehouse',      address: '200 Industrial Zone, Block C', branch_type: BranchType.WAREHOUSE },
  ];

  const branches: Record<string, string> = {};
  for (const b of branchData) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
    branches[b.code] = branch.id;
    console.log(`  ✅ ${b.name}`);
  }

  // ─── BRANCH USERS (credentials) ───────────────────────────────────────────
  console.log('\n👤 Creating branch users...');

  const userSeed = [
    { email: 'main@acestudios.com',  password: 'main@123',  role: Role.ADMIN,            branchCode: 'ACE-MAIN'  },
    { email: 'east@acestudios.com',  password: 'east@123',  role: Role.ADMIN,            branchCode: 'ACE-EAST'  },
    { email: 'west@acestudios.com',  password: 'west@123',  role: Role.ADMIN,            branchCode: 'ACE-WEST'  },
    { email: 'north@acestudios.com', password: 'north@123', role: Role.ADMIN,            branchCode: 'ACE-NORTH' },
    { email: 'warehouse@acestudios.com', password: 'warehouse@123', role: Role.WAREHOUSE_MANAGER, branchCode: 'ACE-WH' },
    { email: 'purchase@acestudios.com',  password: 'purchase@123',  role: Role.PURCHASE_MANAGER,  branchCode: null },
  ];

  const createdUsers: { email: string; password: string; role: string; branch: string }[] = [];

  for (const u of userSeed) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) { console.log(`  ⚠️  ${u.email} already exists — skipped`); continue; }
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        email: u.email,
        password: hashed,
        role: u.role,
        branch_id: u.branchCode ? branches[u.branchCode] : null,
      },
    });
    createdUsers.push({ email: u.email, password: u.password, role: u.role, branch: u.branchCode || 'No Branch' });
    console.log(`  ✅ ${u.email} [${u.role}]`);
  }

  // ─── EXTRA CATEGORIES ─────────────────────────────────────────────────────
  console.log('\n🗂️  Creating categories...');

  const catData = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
    { name: 'Frozen Foods',        slug: 'frozen-foods'      },
    { name: 'Cleaning Supplies',   slug: 'cleaning-supplies' },
    { name: 'Personal Care',       slug: 'personal-care'     },
    { name: 'Breakfast & Cereals', slug: 'breakfast-cereals' },
    { name: 'Condiments & Sauces', slug: 'condiments-sauces' },
    { name: 'Canned & Jarred',     slug: 'canned-jarred'     },
    { name: 'Health & Wellness',   slug: 'health-wellness'   },
  ];

  const cats: Record<string, string> = {};
  for (const c of catData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug, display_on_branches: [], display_on_pos: true },
    });
    cats[c.slug] = cat.id;
    console.log(`  ✅ ${c.name}`);
  }

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  console.log('\n📦 Creating products...');

  const productList = [
    // Fruits & Vegetables
    { code: 'FV-001', sku: 'SKU-FV-001', name: 'Fresh Bananas 1kg',        slug: 'fruits-vegetables', unit: kg,  buy: 80,  sell: 120 },
    { code: 'FV-002', sku: 'SKU-FV-002', name: 'Red Apples 1kg',           slug: 'fruits-vegetables', unit: kg,  buy: 150, sell: 220 },
    { code: 'FV-003', sku: 'SKU-FV-003', name: 'Baby Spinach 200g',        slug: 'fruits-vegetables', unit: pkt, buy: 60,  sell: 95  },
    { code: 'FV-004', sku: 'SKU-FV-004', name: 'Cherry Tomatoes 250g',     slug: 'fruits-vegetables', unit: pkt, buy: 80,  sell: 130 },
    { code: 'FV-005', sku: 'SKU-FV-005', name: 'Avocado (each)',           slug: 'fruits-vegetables', unit: pcs, buy: 90,  sell: 150 },
    { code: 'FV-006', sku: 'SKU-FV-006', name: 'Sweet Corn 3 Pack',        slug: 'fruits-vegetables', unit: pkt, buy: 70,  sell: 110 },

    // Frozen Foods
    { code: 'FRZ-001', sku: 'SKU-FRZ-001', name: 'Frozen Chicken Nuggets 500g', slug: 'frozen-foods', unit: pkt, buy: 280, sell: 420 },
    { code: 'FRZ-002', sku: 'SKU-FRZ-002', name: 'Frozen Peas 400g',            slug: 'frozen-foods', unit: pkt, buy: 100, sell: 160 },
    { code: 'FRZ-003', sku: 'SKU-FRZ-003', name: 'Ice Cream Vanilla 1L',        slug: 'frozen-foods', unit: ltr, buy: 200, sell: 320 },
    { code: 'FRZ-004', sku: 'SKU-FRZ-004', name: 'Frozen Pizza Margherita',     slug: 'frozen-foods', unit: pcs, buy: 350, sell: 520 },
    { code: 'FRZ-005', sku: 'SKU-FRZ-005', name: 'Frozen French Fries 1kg',     slug: 'frozen-foods', unit: kg,  buy: 180, sell: 280 },

    // Cleaning Supplies
    { code: 'CLN-001', sku: 'SKU-CLN-001', name: 'Dish Wash Liquid 500ml',  slug: 'cleaning-supplies', unit: pcs, buy: 80,  sell: 130 },
    { code: 'CLN-002', sku: 'SKU-CLN-002', name: 'Floor Cleaner 1L',        slug: 'cleaning-supplies', unit: ltr, buy: 120, sell: 190 },
    { code: 'CLN-003', sku: 'SKU-CLN-003', name: 'Laundry Detergent 1kg',   slug: 'cleaning-supplies', unit: kg,  buy: 200, sell: 310 },
    { code: 'CLN-004', sku: 'SKU-CLN-004', name: 'Multi-Surface Spray',     slug: 'cleaning-supplies', unit: pcs, buy: 150, sell: 230 },
    { code: 'CLN-005', sku: 'SKU-CLN-005', name: 'Garbage Bags 30pc',       slug: 'cleaning-supplies', unit: pkt, buy: 90,  sell: 145 },

    // Personal Care
    { code: 'PC-001', sku: 'SKU-PC-001', name: 'Shampoo 400ml',            slug: 'personal-care', unit: pcs, buy: 180, sell: 280 },
    { code: 'PC-002', sku: 'SKU-PC-002', name: 'Body Lotion 250ml',        slug: 'personal-care', unit: pcs, buy: 150, sell: 240 },
    { code: 'PC-003', sku: 'SKU-PC-003', name: 'Toothpaste 120g',          slug: 'personal-care', unit: pcs, buy: 80,  sell: 130 },
    { code: 'PC-004', sku: 'SKU-PC-004', name: 'Deodorant Roll-On 50ml',   slug: 'personal-care', unit: pcs, buy: 120, sell: 195 },
    { code: 'PC-005', sku: 'SKU-PC-005', name: 'Face Wash Gel 100ml',      slug: 'personal-care', unit: pcs, buy: 160, sell: 250 },
    { code: 'PC-006', sku: 'SKU-PC-006', name: 'Hand Sanitizer 200ml',     slug: 'personal-care', unit: pcs, buy: 100, sell: 160 },

    // Breakfast & Cereals
    { code: 'BRK-001', sku: 'SKU-BRK-001', name: 'Oatmeal Quick Cook 500g',   slug: 'breakfast-cereals', unit: pkt, buy: 130, sell: 200 },
    { code: 'BRK-002', sku: 'SKU-BRK-002', name: 'Corn Flakes 375g',          slug: 'breakfast-cereals', unit: box, buy: 160, sell: 250 },
    { code: 'BRK-003', sku: 'SKU-BRK-003', name: 'Chocolate Granola 400g',    slug: 'breakfast-cereals', unit: pkt, buy: 200, sell: 310 },
    { code: 'BRK-004', sku: 'SKU-BRK-004', name: 'Pancake Mix 500g',          slug: 'breakfast-cereals', unit: pkt, buy: 140, sell: 220 },
    { code: 'BRK-005', sku: 'SKU-BRK-005', name: 'Strawberry Jam 340g',       slug: 'breakfast-cereals', unit: pcs, buy: 110, sell: 175 },

    // Condiments & Sauces
    { code: 'CON-001', sku: 'SKU-CON-001', name: 'Tomato Ketchup 500g',    slug: 'condiments-sauces', unit: pcs, buy: 90,  sell: 145 },
    { code: 'CON-002', sku: 'SKU-CON-002', name: 'Soy Sauce 250ml',        slug: 'condiments-sauces', unit: pcs, buy: 80,  sell: 130 },
    { code: 'CON-003', sku: 'SKU-CON-003', name: 'Mayonnaise 300g',        slug: 'condiments-sauces', unit: pcs, buy: 120, sell: 190 },
    { code: 'CON-004', sku: 'SKU-CON-004', name: 'Hot Chilli Sauce 200ml', slug: 'condiments-sauces', unit: pcs, buy: 70,  sell: 115 },
    { code: 'CON-005', sku: 'SKU-CON-005', name: 'Olive Oil Extra Virgin 500ml', slug: 'condiments-sauces', unit: ltr, buy: 450, sell: 680 },

    // Canned & Jarred
    { code: 'CAN-001', sku: 'SKU-CAN-001', name: 'Canned Tuna in Water',   slug: 'canned-jarred', unit: pcs, buy: 90,  sell: 145 },
    { code: 'CAN-002', sku: 'SKU-CAN-002', name: 'Chickpeas 400g Can',     slug: 'canned-jarred', unit: pcs, buy: 70,  sell: 115 },
    { code: 'CAN-003', sku: 'SKU-CAN-003', name: 'Peanut Butter 340g',     slug: 'canned-jarred', unit: pcs, buy: 200, sell: 310 },
    { code: 'CAN-004', sku: 'SKU-CAN-004', name: 'Coconut Milk 400ml',     slug: 'canned-jarred', unit: pcs, buy: 80,  sell: 130 },
    { code: 'CAN-005', sku: 'SKU-CAN-005', name: 'Tomato Paste 200g',      slug: 'canned-jarred', unit: pcs, buy: 50,  sell: 85  },

    // Health & Wellness
    { code: 'HW-001', sku: 'SKU-HW-001', name: 'Vitamin C 1000mg 60 Tabs', slug: 'health-wellness', unit: box, buy: 350, sell: 550 },
    { code: 'HW-002', sku: 'SKU-HW-002', name: 'Multivitamin Daily 30 Caps', slug: 'health-wellness', unit: box, buy: 400, sell: 620 },
    { code: 'HW-003', sku: 'SKU-HW-003', name: 'Protein Bar Chocolate',    slug: 'health-wellness', unit: pcs, buy: 150, sell: 240 },
    { code: 'HW-004', sku: 'SKU-HW-004', name: 'Omega-3 Fish Oil 60 Caps', slug: 'health-wellness', unit: box, buy: 500, sell: 780 },
    { code: 'HW-005', sku: 'SKU-HW-005', name: 'Aloe Vera Gel 200ml',      slug: 'health-wellness', unit: pcs, buy: 130, sell: 200 },
  ];

  let created = 0, skipped = 0;
  for (const p of productList) {
    const exists = await prisma.product.findUnique({ where: { code: p.code } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({
      data: {
        code: p.code,
        sku: p.sku,
        name: p.name,
        category_id: cats[p.slug],
        unit_id: p.unit.id,
        purchase_rate: p.buy,
        sales_rate_exc_dis_and_tax: p.sell,
        sales_rate_inc_dis_and_tax: p.sell,
      },
    });
    created++;
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BRANCHES CREATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Code       Name');
  for (const b of branchData) console.log(`  ${b.code.padEnd(12)} ${b.name}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BRANCH LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const u of createdUsers) {
    console.log(`  Email   : ${u.email}`);
    console.log(`  Password: ${u.password}`);
    console.log(`  Role    : ${u.role}`);
    console.log(`  Branch  : ${u.branch}`);
    console.log('  ─────────────────────────────────────────────────');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PRODUCTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Created : ${created}`);
  console.log(`  Skipped : ${skipped} (already exist)`);
  const grouped: Record<string, number> = {};
  for (const p of productList) grouped[p.slug] = (grouped[p.slug] || 0) + 1;
  for (const [slug, count] of Object.entries(grouped)) {
    const name = catData.find(c => c.slug === slug)?.name || slug;
    console.log(`  • ${name.padEnd(25)} ${count} products`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

run()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
