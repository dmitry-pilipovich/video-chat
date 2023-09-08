import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, imageUrl } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const { serverId } = params;

    const existingServer = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id
      }
    });

    if (existingServer) {
      const updatedServer = await db.server.update({
        where: {
          id: serverId
        },
        data: {
          name,
          imageUrl
        }
      });

      return NextResponse.json(updatedServer);
    }

    return new NextResponse("Access denied", { status: 403 });
  } catch (err) {
    console.log("[SERVER_ID]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
