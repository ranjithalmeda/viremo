import { randomUUID } from "node:crypto";

import type { EntryType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { createSupabaseStorageClient } from "@/src/lib/supabase-storage";

const categories = new Set<EntryType>(["MOVIE", "SERIES", "ANIME", "BOOK"]);
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const posts = await prisma.communityPost.findMany({
    where: categories.has(category as EntryType)
      ? { category: category as EntryType }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          publicId: true,
          image: true,
          avatarUrl: true,
        },
      },
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "") as EntryType;
  const youtubeUrl = String(formData.get("youtubeUrl") || "").trim() || null;

  if (!title || !description || !categories.has(category)) {
    return NextResponse.json(
      { error: "Title, description, and category are required." },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0)
    .slice(0, 3);
  const imageUrls: string[] = [];

  if (files.length) {
    const supabase = createSupabaseStorageClient();

    for (const file of files) {
      const extension = allowedImageTypes.get(file.type);

      if (!extension) {
        return NextResponse.json(
          { error: "Community images must be JPG or PNG." },
          { status: 400 },
        );
      }

      const path = `${session.user.id}/${randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("community")
        .upload(path, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type,
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      imageUrls.push(supabase.storage.from("community").getPublicUrl(path).data.publicUrl);
    }
  }

  const post = await prisma.communityPost.create({
    data: {
      userId: session.user.id,
      title,
      description,
      category,
      imageUrls,
      youtubeUrl,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
