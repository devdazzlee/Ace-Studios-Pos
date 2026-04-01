import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log('Creating units...');

  const units = await Promise.all([
    prisma.unit.upsert({ where: { code: 'PCS' }, update: {}, create: { code: 'PCS', name: 'Pieces' } }),
    prisma.unit.upsert({ where: { code: 'KG' },  update: {}, create: { code: 'KG',  name: 'Kilogram' } }),
    prisma.unit.upsert({ where: { code: 'PKT' }, update: {}, create: { code: 'PKT', name: 'Packet' } }),
    prisma.unit.upsert({ where: { code: 'LTR' }, update: {}, create: { code: 'LTR', name: 'Litre' } }),
    prisma.unit.upsert({ where: { code: 'DZN' }, update: {}, create: { code: 'DZN', name: 'Dozen' } }),
  ]);

  const [pcs, kg, pkt, ltr, dzn] = units;
  console.log('Units ready.');

  console.log('Creating categories...');

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'bakery' },     update: {}, create: { name: 'Bakery',     slug: 'bakery',     display_on_branches: [], display_on_pos: true } }),
    prisma.category.upsert({ where: { slug: 'beverages' },  update: {}, create: { name: 'Beverages',  slug: 'beverages',  display_on_branches: [], display_on_pos: true } }),
    prisma.category.upsert({ where: { slug: 'dairy' },      update: {}, create: { name: 'Dairy',      slug: 'dairy',      display_on_branches: [], display_on_pos: true } }),
    prisma.category.upsert({ where: { slug: 'snacks' },     update: {}, create: { name: 'Snacks',     slug: 'snacks',     display_on_branches: [], display_on_pos: true } }),
    prisma.category.upsert({ where: { slug: 'stationery' }, update: {}, create: { name: 'Stationery', slug: 'stationery', display_on_branches: [], display_on_pos: true } }),
  ]);

  const [bakery, beverages, dairy, snacks, stationery] = categories;
  console.log('Categories ready.');

  console.log('Creating products...');

  const products = [
    // Bakery
    { code: 'BAK-001', sku: 'SKU-BAK-001', name: 'Butter Croissant',      category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 40,  sales_rate_exc_dis_and_tax: 60,  sales_rate_inc_dis_and_tax: 60  },
    { code: 'BAK-002', sku: 'SKU-BAK-002', name: 'Whole Wheat Bread',      category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 80,  sales_rate_exc_dis_and_tax: 120, sales_rate_inc_dis_and_tax: 120 },
    { code: 'BAK-003', sku: 'SKU-BAK-003', name: 'Chocolate Muffin',       category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 50,  sales_rate_exc_dis_and_tax: 90,  sales_rate_inc_dis_and_tax: 90  },
    { code: 'BAK-004', sku: 'SKU-BAK-004', name: 'Cinnamon Roll',          category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 60,  sales_rate_exc_dis_and_tax: 100, sales_rate_inc_dis_and_tax: 100 },
    { code: 'BAK-005', sku: 'SKU-BAK-005', name: 'Sourdough Loaf',         category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 150, sales_rate_exc_dis_and_tax: 220, sales_rate_inc_dis_and_tax: 220 },
    { code: 'BAK-006', sku: 'SKU-BAK-006', name: 'Blueberry Scone',        category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 55,  sales_rate_exc_dis_and_tax: 85,  sales_rate_inc_dis_and_tax: 85  },
    { code: 'BAK-007', sku: 'SKU-BAK-007', name: 'Baguette',               category_id: bakery.id,     unit_id: pcs.id, purchase_rate: 70,  sales_rate_exc_dis_and_tax: 110, sales_rate_inc_dis_and_tax: 110 },
    { code: 'BAK-008', sku: 'SKU-BAK-008', name: 'Glazed Doughnut',        category_id: bakery.id,     unit_id: dzn.id, purchase_rate: 200, sales_rate_exc_dis_and_tax: 350, sales_rate_inc_dis_and_tax: 350 },

    // Beverages
    { code: 'BEV-001', sku: 'SKU-BEV-001', name: 'Orange Juice 1L',        category_id: beverages.id,  unit_id: ltr.id, purchase_rate: 90,  sales_rate_exc_dis_and_tax: 140, sales_rate_inc_dis_and_tax: 140 },
    { code: 'BEV-002', sku: 'SKU-BEV-002', name: 'Green Tea Pack',         category_id: beverages.id,  unit_id: pkt.id, purchase_rate: 120, sales_rate_exc_dis_and_tax: 180, sales_rate_inc_dis_and_tax: 180 },
    { code: 'BEV-003', sku: 'SKU-BEV-003', name: 'Mineral Water 500ml',    category_id: beverages.id,  unit_id: pcs.id, purchase_rate: 30,  sales_rate_exc_dis_and_tax: 50,  sales_rate_inc_dis_and_tax: 50  },
    { code: 'BEV-004', sku: 'SKU-BEV-004', name: 'Cold Brew Coffee',       category_id: beverages.id,  unit_id: pcs.id, purchase_rate: 150, sales_rate_exc_dis_and_tax: 250, sales_rate_inc_dis_and_tax: 250 },
    { code: 'BEV-005', sku: 'SKU-BEV-005', name: 'Mango Smoothie 250ml',   category_id: beverages.id,  unit_id: pcs.id, purchase_rate: 80,  sales_rate_exc_dis_and_tax: 130, sales_rate_inc_dis_and_tax: 130 },

    // Dairy
    { code: 'DAI-001', sku: 'SKU-DAI-001', name: 'Full Cream Milk 1L',     category_id: dairy.id,      unit_id: ltr.id, purchase_rate: 100, sales_rate_exc_dis_and_tax: 145, sales_rate_inc_dis_and_tax: 145 },
    { code: 'DAI-002', sku: 'SKU-DAI-002', name: 'Cheddar Cheese 200g',    category_id: dairy.id,      unit_id: pcs.id, purchase_rate: 180, sales_rate_exc_dis_and_tax: 260, sales_rate_inc_dis_and_tax: 260 },
    { code: 'DAI-003', sku: 'SKU-DAI-003', name: 'Greek Yogurt 400g',      category_id: dairy.id,      unit_id: pcs.id, purchase_rate: 130, sales_rate_exc_dis_and_tax: 190, sales_rate_inc_dis_and_tax: 190 },
    { code: 'DAI-004', sku: 'SKU-DAI-004', name: 'Salted Butter 250g',     category_id: dairy.id,      unit_id: pcs.id, purchase_rate: 200, sales_rate_exc_dis_and_tax: 290, sales_rate_inc_dis_and_tax: 290 },
    { code: 'DAI-005', sku: 'SKU-DAI-005', name: 'Fresh Cream 200ml',      category_id: dairy.id,      unit_id: pcs.id, purchase_rate: 90,  sales_rate_exc_dis_and_tax: 140, sales_rate_inc_dis_and_tax: 140 },

    // Snacks
    { code: 'SNK-001', sku: 'SKU-SNK-001', name: 'Classic Potato Chips',   category_id: snacks.id,     unit_id: pkt.id, purchase_rate: 60,  sales_rate_exc_dis_and_tax: 95,  sales_rate_inc_dis_and_tax: 95  },
    { code: 'SNK-002', sku: 'SKU-SNK-002', name: 'Mixed Nuts 150g',        category_id: snacks.id,     unit_id: pkt.id, purchase_rate: 250, sales_rate_exc_dis_and_tax: 380, sales_rate_inc_dis_and_tax: 380 },
    { code: 'SNK-003', sku: 'SKU-SNK-003', name: 'Dark Chocolate Bar',     category_id: snacks.id,     unit_id: pcs.id, purchase_rate: 120, sales_rate_exc_dis_and_tax: 180, sales_rate_inc_dis_and_tax: 180 },
    { code: 'SNK-004', sku: 'SKU-SNK-004', name: 'Granola Bar',            category_id: snacks.id,     unit_id: pcs.id, purchase_rate: 70,  sales_rate_exc_dis_and_tax: 110, sales_rate_inc_dis_and_tax: 110 },
    { code: 'SNK-005', sku: 'SKU-SNK-005', name: 'Popcorn Caramel 100g',   category_id: snacks.id,     unit_id: pkt.id, purchase_rate: 80,  sales_rate_exc_dis_and_tax: 130, sales_rate_inc_dis_and_tax: 130 },

    // Stationery
    { code: 'STA-001', sku: 'SKU-STA-001', name: 'Ballpoint Pen Blue',     category_id: stationery.id, unit_id: pcs.id, purchase_rate: 15,  sales_rate_exc_dis_and_tax: 30,  sales_rate_inc_dis_and_tax: 30  },
    { code: 'STA-002', sku: 'SKU-STA-002', name: 'A4 Notebook 200 Pages',  category_id: stationery.id, unit_id: pcs.id, purchase_rate: 80,  sales_rate_exc_dis_and_tax: 130, sales_rate_inc_dis_and_tax: 130 },
    { code: 'STA-003', sku: 'SKU-STA-003', name: 'Highlighter Set 5pc',    category_id: stationery.id, unit_id: pcs.id, purchase_rate: 90,  sales_rate_exc_dis_and_tax: 150, sales_rate_inc_dis_and_tax: 150 },
    { code: 'STA-004', sku: 'SKU-STA-004', name: 'Sticky Notes 100 Pack',  category_id: stationery.id, unit_id: pkt.id, purchase_rate: 50,  sales_rate_exc_dis_and_tax: 85,  sales_rate_inc_dis_and_tax: 85  },
    { code: 'STA-005', sku: 'SKU-STA-005', name: 'Scissors Stainless',     category_id: stationery.id, unit_id: pcs.id, purchase_rate: 60,  sales_rate_exc_dis_and_tax: 100, sales_rate_inc_dis_and_tax: 100 },
  ];

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { code: p.code } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({ data: p });
    created++;
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Products created : ${created}`);
  console.log(`  Products skipped : ${skipped} (already exist)`);
  console.log('');
  console.log('  Categories added:');
  console.log('   • Bakery      (8 products)');
  console.log('   • Beverages   (5 products)');
  console.log('   • Dairy       (5 products)');
  console.log('   • Snacks      (5 products)');
  console.log('   • Stationery  (5 products)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

run()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
