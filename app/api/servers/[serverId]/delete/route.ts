import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const existingServer = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id
      }
    });

    if (existingServer) {
      const server = await db.server.delete({
        where: {
          id: existingServer.id
        }
      });

      const profileServer = await db.server.findMany({
        where: {
          members: {
            some: {
              profileId: profile.id
            }
          }
        }
      });

      if (profileServer.length === 0) {
        return NextResponse.json(server);
      } else {
        return NextResponse.json({ serverId: profileServer[0].id });
      }
    }

    return new NextResponse("Access denied", { status: 403 });
  } catch (err) {
    console.log("[DELETE_SERVER_ID]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
