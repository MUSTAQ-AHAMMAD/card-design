import prisma from '../lib/prisma'
import { sendGiftCardEmail } from './emailService'

const POLL_INTERVAL_MS = 60 * 1000 // check every 60 seconds

/**
 * Process a single scheduled gift card: send the email and mark it SENT.
 */
async function processScheduledGiftCard(giftCardId: string): Promise<void> {
  // Re-fetch with a lock-like check to avoid duplicate sends
  const giftCard = await prisma.giftCard.findFirst({
    where: { id: giftCardId, status: 'DRAFT', deletedAt: null },
    include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
  })

  if (!giftCard || !giftCard.recipientEmail) return

  let emailStatus = 'SENT'
  let emailError: string | null = null

  try {
    await sendGiftCardEmail(
      {
        id: giftCard.id,
        amount: giftCard.amount,
        occasion: giftCard.occasion,
        message: giftCard.message,
        employee: giftCard.employee,
      },
      giftCard.recipientEmail
    )
  } catch (err) {
    emailStatus = 'FAILED'
    emailError = err instanceof Error ? err.message : 'Failed to send scheduled email'
  }

  const now = new Date()
  await Promise.all([
    prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { status: 'SENT', sentAt: now },
    }),
    prisma.emailLog.create({
      data: {
        giftCardId: giftCard.id,
        userId: giftCard.employeeId,
        recipient: giftCard.recipientEmail,
        subject: `You've received a ${giftCard.occasion} Gift Card!`,
        status: emailStatus,
        error: emailError,
        sentAt: emailStatus === 'SENT' ? now : null,
      },
    }),
  ])

  if (emailStatus === 'SENT') {
    console.log(`[Scheduler] Sent scheduled gift card ${giftCard.id} to ${giftCard.recipientEmail}`)
  } else {
    console.error(`[Scheduler] Failed to send scheduled gift card ${giftCard.id}: ${emailError}`)
  }
}

/**
 * Poll the database for gift cards whose scheduledAt time has arrived and send them.
 */
async function runScheduler(): Promise<void> {
  try {
    const now = new Date()
    const duecards = await prisma.giftCard.findMany({
      where: {
        status: 'DRAFT',
        deletedAt: null,
        scheduledAt: { lte: now },
        recipientEmail: { not: null },
      },
      select: { id: true },
    })

    if (duecards.length > 0) {
      console.log(`[Scheduler] Processing ${duecards.length} scheduled gift card(s)`)
      await Promise.allSettled(duecards.map((c) => processScheduledGiftCard(c.id)))
    }
  } catch (err) {
    console.error('[Scheduler] Error during scheduled gift card processing:', err)
  }
}

/**
 * Start the background scheduler.
 * Runs an immediate check then polls every POLL_INTERVAL_MS milliseconds.
 */
export function startScheduler(): void {
  console.log('[Scheduler] Started — checking for scheduled gift cards every 60 seconds')
  // Run once immediately on startup, then on interval
  runScheduler()
  setInterval(runScheduler, POLL_INTERVAL_MS)
}
