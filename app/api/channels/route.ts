import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("[Bad Request] - Server ID is missing", {
        status: 400
      });
    }

    if (name === "general") {
      return new NextResponse("[Bad Request] - Name cannot be general", {
        status: 400
      });
    }

    const existingServer = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      }
    });

    if (existingServer) {
      const server = await db.server.update({
        where: {
          id: existingServer.id
        },
        data: {
          channels: {
            create: {
              name,
              type,
              profileId: profile.id
            }
          }
        }
      });

      return NextResponse.json(server);
    }

    return new NextResponse("Access denied", { status: 403 });
  } catch (err) {
    console.error("[CHANNELS_POST]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
