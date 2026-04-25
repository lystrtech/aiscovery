import { hash } from 'bcryptjs';
import { Pillar, PrismaClient, ReviewStatus, ReviewTargetType, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.companyCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.company.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Generative AI & LLMs',
        slug: 'generative-ai-llms',
        pillar: Pillar.AI_CAPABILITIES,
        description: 'Foundation models, LLM apps, and multimodal generation tools.'
      }
    }),
    prisma.category.create({
      data: {
        name: 'AI for Marketing',
        slug: 'ai-for-marketing',
        pillar: Pillar.AI_SOLUTIONS,
        description: 'Content, campaign, and customer intelligence tools for marketing teams.'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Vector Databases',
        slug: 'vector-databases',
        pillar: Pillar.AI_INFRASTRUCTURE,
        description: 'Databases optimized for semantic search and RAG workloads.'
      }
    }),
    prisma.category.create({
      data: {
        name: 'AI Consultancies',
        slug: 'ai-consultancies',
        pillar: Pillar.ECOSYSTEM_SERVICES,
        description: 'Consultancies and system integrators helping teams adopt AI.'
      }
    })
  ]);

  const [openai, anthropic, deepmind] = await Promise.all([
    prisma.company.create({
      data: {
        name: 'OpenAI',
        slug: 'openai',
        websiteUrl: 'https://openai.com',
        shortDescription: 'Research and deployment company focused on advanced AI systems.',
        headquarters: 'San Francisco, CA',
        foundedYear: 2015,
        employeeRange: '1000-5000'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Anthropic',
        slug: 'anthropic',
        websiteUrl: 'https://anthropic.com',
        shortDescription: 'AI safety and product company behind Claude models.',
        headquarters: 'San Francisco, CA',
        foundedYear: 2021,
        employeeRange: '500-1000'
      }
    }),
    prisma.company.create({
      data: {
        name: 'DeepMind',
        slug: 'deepmind',
        websiteUrl: 'https://deepmind.google',
        shortDescription: 'Google DeepMind builds advanced AI models and systems.',
        headquarters: 'London, UK',
        foundedYear: 2010,
        employeeRange: '1000-5000'
      }
    })
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'ChatGPT',
        slug: 'chatgpt',
        companyId: openai.id,
        shortDescription: 'General-purpose conversational AI assistant.',
        pricingModel: 'Freemium',
        deployment: 'SaaS'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Sora',
        slug: 'sora',
        companyId: openai.id,
        shortDescription: 'Text-to-video generation model.',
        pricingModel: 'Subscription',
        deployment: 'SaaS'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Codex',
        slug: 'codex',
        companyId: openai.id,
        shortDescription: 'Code-focused AI model for software development workflows.',
        pricingModel: 'API usage-based',
        deployment: 'API'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Claude',
        slug: 'claude',
        companyId: anthropic.id,
        shortDescription: 'Enterprise and personal AI assistant.',
        pricingModel: 'Subscription',
        deployment: 'SaaS/API'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Gemini',
        slug: 'gemini',
        companyId: deepmind.id,
        shortDescription: 'Multimodal model family for assistants and developer tooling.',
        pricingModel: 'Freemium',
        deployment: 'SaaS/API'
      }
    })
  ]);

  const catBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));
  const productBySlug = Object.fromEntries(products.map((product) => [product.slug, product]));

  await prisma.companyCategory.createMany({
    data: [
      { companyId: openai.id, categoryId: catBySlug['generative-ai-llms'].id },
      { companyId: anthropic.id, categoryId: catBySlug['generative-ai-llms'].id },
      { companyId: deepmind.id, categoryId: catBySlug['generative-ai-llms'].id },
      { companyId: openai.id, categoryId: catBySlug['ai-for-marketing'].id }
    ]
  });

  await prisma.productCategory.createMany({
    data: [
      { productId: productBySlug.chatgpt.id, categoryId: catBySlug['generative-ai-llms'].id },
      { productId: productBySlug.sora.id, categoryId: catBySlug['generative-ai-llms'].id },
      { productId: productBySlug.codex.id, categoryId: catBySlug['generative-ai-llms'].id },
      { productId: productBySlug.claude.id, categoryId: catBySlug['generative-ai-llms'].id },
      { productId: productBySlug.gemini.id, categoryId: catBySlug['generative-ai-llms'].id }
    ]
  });

  const adminPasswordHash = await hash('Admin123!ChangeMe', 10);
  const expertPasswordHash = await hash('Expert123!ChangeMe', 10);
  const userPasswordHash = await hash('User123!ChangeMe', 10);

  const [_adminUser, expertUser, communityUser] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@aiscovery.dev',
        role: Role.ADMIN,
        passwordHash: adminPasswordHash
      }
    }),
    prisma.user.create({
      data: {
        name: 'AIScovery Editorial Team',
        email: 'expert@aiscovery.dev',
        role: Role.EXPERT,
        passwordHash: expertPasswordHash
      }
    }),
    prisma.user.create({
      data: {
        name: 'Alex User',
        email: 'alex@example.com',
        role: Role.USER,
        passwordHash: userPasswordHash
      }
    })
  ]);

  await prisma.review.createMany({
    data: [
      {
        userId: expertUser.id,
        targetType: ReviewTargetType.COMPANY,
        companyId: openai.id,
        rating: 5,
        title: 'Top-tier innovation velocity',
        body: 'OpenAI continues to ship category-defining products at an impressive pace.',
        isExpert: true,
        status: ReviewStatus.APPROVED
      },
      {
        userId: communityUser.id,
        targetType: ReviewTargetType.COMPANY,
        companyId: openai.id,
        rating: 4,
        title: 'Great ecosystem',
        body: 'Very strong APIs and product lineup for teams building quickly.',
        isExpert: false,
        status: ReviewStatus.APPROVED
      },
      {
        userId: expertUser.id,
        targetType: ReviewTargetType.PRODUCT,
        productId: productBySlug.chatgpt.id,
        rating: 5,
        title: 'Best-in-class assistant UX',
        body: 'A strong mix of capability, polish, and integrations for broad use cases.',
        isExpert: true,
        status: ReviewStatus.APPROVED
      },
      {
        userId: communityUser.id,
        targetType: ReviewTargetType.PRODUCT,
        productId: productBySlug.claude.id,
        rating: 4,
        title: 'Reliable for long-form drafting',
        body: 'Claude is effective for brainstorming and editing long documents.',
        isExpert: false,
        status: ReviewStatus.APPROVED
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
