import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
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

    if (!params.channelId) {
      return new NextResponse("[Bad Request] - Channel ID is missing", {
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

    if (!existingServer) {
      return new NextResponse("Access denied", { status: 403 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: params.channelId
      }
    });

    if (!channel || channel.name === "general") {
      return new NextResponse("[Bad Request] - Wrong data", {
        status: 400
      });
    }

    const { id, name: serverName } = await db.server.update({
      where: {
        id: existingServer.id
      },
      data: {
        channels: {
          delete: {
            id: params.channelId
          }
        }
      }
    });

    return NextResponse.json({ id, serverName });
  } catch (err) {
    console.error("[CHANNELS_DELETE]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { channelId: string } }
) {
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

    if (!params.channelId) {
      return new NextResponse("[Bad Request] - Channel ID is missing", {
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

    if (!existingServer) {
      return new NextResponse("Access denied", { status: 403 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: params.channelId,
        name: {
          not: "general"
        }
      }
    });

    if (!channel) {
      return new NextResponse("[Bad Request] - Wrong data provided", {
        status: 400
      });
    }

    const { id, name: serverName } = await db.server.update({
      where: {
        id: existingServer.id
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId
            },
            data: {
              name,
              type
            }
          }
        }
      }
    });

    return NextResponse.json({ id, serverName });
  } catch (err) {
    console.error("[CHANNELS_DELETE]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
