import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const hrPassword = await bcrypt.hash('Hr123!', 10)
  const employeePassword = await bcrypt.hash('Employee123!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const hr = await prisma.user.upsert({
    where: { email: 'hr@example.com' },
    update: {},
    create: {
      email: 'hr@example.com',
      password: hrPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR_MANAGER',
      isActive: true,
    },
  })

  const employees = await Promise.all([
    prisma.user.upsert({
      where: { email: 'employee1@example.com' },
      update: {},
      create: {
        email: 'employee1@example.com',
        password: employeePassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'EMPLOYEE',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'employee2@example.com' },
      update: {},
      create: {
        email: 'employee2@example.com',
        password: employeePassword,
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'EMPLOYEE',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'employee3@example.com' },
      update: {},
      create: {
        email: 'employee3@example.com',
        password: employeePassword,
        firstName: 'Carol',
        lastName: 'Davis',
        role: 'EMPLOYEE',
        isActive: true,
      },
    }),
  ])

  await prisma.template.upsert({
    where: { id: 'template-birthday' },
    update: {},
    create: {
      id: 'template-birthday',
      name: 'Birthday Celebration',
      category: 'Birthday',
      designData: JSON.stringify({
        background: '#FFD700',
        primaryColor: '#FF6B6B',
        fontFamily: 'Arial',
        layout: 'celebration',
      }),
      thumbnail: 'https://via.placeholder.com/300x200?text=Birthday',
      createdById: admin.id,
    },
  })

  await prisma.template.upsert({
    where: { id: 'template-anniversary' },
    update: {},
    create: {
      id: 'template-anniversary',
      name: 'Work Anniversary',
      category: 'Anniversary',
      designData: JSON.stringify({
        background: '#4F46E5',
        primaryColor: '#FFFFFF',
        fontFamily: 'Georgia',
        layout: 'elegant',
      }),
      thumbnail: 'https://via.placeholder.com/300x200?text=Anniversary',
      createdById: admin.id,
    },
  })

  await prisma.template.upsert({
    where: { id: 'template-recognition' },
    update: {},
    create: {
      id: 'template-recognition',
      name: 'Employee Recognition',
      category: 'Recognition',
      designData: JSON.stringify({
        background: '#10B981',
        primaryColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        layout: 'award',
      }),
      thumbnail: 'https://via.placeholder.com/300x200?text=Recognition',
      createdById: admin.id,
    },
  })

  await prisma.emailTemplate.upsert({
    where: { id: 'email-template-gift' },
    update: {},
    create: {
      id: 'email-template-gift',
      name: 'Gift Card Notification',
      subject: "You've received a {{occasion}} Gift Card!",
      body: '<h1>Congratulations!</h1><p>You have received a gift card worth ${{amount}} for {{occasion}}.</p><p>{{message}}</p>',
      variables: JSON.stringify(['occasion', 'amount', 'message', 'senderName']),
    },
  })

  await prisma.emailTemplate.upsert({
    where: { id: 'email-template-welcome' },
    update: {},
    create: {
      id: 'email-template-welcome',
      name: 'Welcome Email',
      subject: 'Welcome to the Gift Card System!',
      body: '<h1>Welcome, {{firstName}}!</h1><p>Your account has been created successfully.</p>',
      variables: JSON.stringify(['firstName', 'lastName', 'email']),
    },
  })

  void hr
  void employees

  console.log('Seed completed successfully!')
  console.log(`Created users: admin@example.com, hr@example.com, employee1-3@example.com`)
  console.log(`Created 3 gift card templates and 2 email templates`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
