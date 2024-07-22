"use server";

import { database } from "@/db/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { items } from "@/db/schema";

export async function createItemAction({
  fileName,
  name,
  startingPrice,
  endDate,
}: {
  fileName: string;
  name: string;
  startingPrice: number;
  endDate: Date;
}) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  await database.insert(items).values({
    name,
    startingPrice,
    fileKey: fileName,
    currentBid: startingPrice,
    userId: user.id,
    endDate,
  });

  redirect("/");
}
