"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { isBidOver } from "@/util/bids";

export async function createBidAction(itemId: number) {
  const session = await auth();

  const userId = session?.user.id;

  if (!userId) {
    throw new Error("You must be logged in to place a bid");
  }

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }
  if (isBidOver(item)) {
    throw new Error("The auction is already over");
  }
  const latestBidValue = item.currentBid + item.bidInterval
  await database.insert(bids).values({
    amount: latestBidValue,
    itemId,
    userId,
    timestamp: new Date(),
  })

  await database
    .update(items)
    .set({
      currentBid: latestBidValue
    })
    .where(eq(items.id, itemId))

  // TODO: add Knock for notification
  revalidatePath(`/items/${itemId}`);
}
