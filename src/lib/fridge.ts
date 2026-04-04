import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const DEFAULT_STORAGE_LOCATIONS = [
  { name: '冷蔵庫', sortOrder: 0 },
  { name: '冷凍庫', sortOrder: 1 },
  { name: '常温', sortOrder: 2 },
]

async function createFridgeWithDefaults(transaction: typeof prisma) {
  const fridge = await transaction.fridge.create({
    data: {},
    select: { id: true },
  })

  await transaction.storageLocation.createMany({
    data: DEFAULT_STORAGE_LOCATIONS.map((location) => ({
      fridgeId: fridge.id,
      name: location.name,
      sortOrder: location.sortOrder,
    })),
  })

  return fridge
}

type FridgeTransactionClient = Prisma.TransactionClient

async function createFridgeWithDefaultsInTransaction(transaction: FridgeTransactionClient) {
  const fridge = await transaction.fridge.create({
    data: {},
    select: { id: true },
  })

  await transaction.storageLocation.createMany({
    data: DEFAULT_STORAGE_LOCATIONS.map((location) => ({
      fridgeId: fridge.id,
      name: location.name,
      sortOrder: location.sortOrder,
    })),
  })

  return fridge
}

export async function getFridgeMembers(fridgeId: string) {
  return prisma.fridgeMember.findMany({
    where: { fridgeId },
    orderBy: { joinedAt: 'asc' },
    select: {
      id: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })
}

export async function createOrRefreshInvitation(fridgeId: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  return prisma.$transaction(async (transaction) => {
    await transaction.fridgeInvitation.deleteMany({ where: { fridgeId } })

    return transaction.fridgeInvitation.create({
      data: {
        fridgeId,
        expiresAt,
      },
      select: {
        token: true,
        expiresAt: true,
      },
    })
  })
}

export async function joinFridgeByInvitation(userId: string, token: string) {
  return prisma.$transaction(async (transaction) => {
    const invitation = await transaction.fridgeInvitation.findUnique({
      where: { token },
      select: {
        fridgeId: true,
        expiresAt: true,
      },
    })

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new Error('INVALID_INVITATION')
    }

    const currentMember = await transaction.fridgeMember.findUnique({
      where: { userId },
      select: { fridgeId: true },
    })

    if (currentMember?.fridgeId === invitation.fridgeId) {
      return { fridgeId: invitation.fridgeId, alreadyJoined: true }
    }

    if (currentMember) {
      await transaction.fridgeMember.delete({ where: { userId } })

      const remainingMembers = await transaction.fridgeMember.count({
        where: { fridgeId: currentMember.fridgeId },
      })

      if (remainingMembers === 0) {
        await transaction.fridge.delete({ where: { id: currentMember.fridgeId } })
      }
    }

    await transaction.fridgeMember.create({
      data: {
        userId,
        fridgeId: invitation.fridgeId,
      },
    })

    return { fridgeId: invitation.fridgeId, alreadyJoined: false }
  })
}

export async function leaveCurrentFridge(userId: string) {
  return prisma.$transaction(async (transaction) => {
    const currentMember = await transaction.fridgeMember.findUnique({
      where: { userId },
      select: { fridgeId: true },
    })

    if (!currentMember) {
      throw new Error('MEMBER_NOT_FOUND')
    }

    await transaction.fridgeMember.delete({ where: { userId } })

    const remainingMembers = await transaction.fridgeMember.count({
      where: { fridgeId: currentMember.fridgeId },
    })

    if (remainingMembers === 0) {
      await transaction.fridge.delete({ where: { id: currentMember.fridgeId } })
    }

    const newFridge = await createFridgeWithDefaultsInTransaction(transaction)

    await transaction.fridgeMember.create({
      data: {
        userId,
        fridgeId: newFridge.id,
      },
    })

    return { fridgeId: newFridge.id }
  })
}
