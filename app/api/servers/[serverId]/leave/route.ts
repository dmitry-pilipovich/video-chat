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
        profileId: {
          not: profile.id
        }
      }
    });

    if (existingServer) {
      const server = await db.server.update({
        where: {
          id: existingServer.id
        },
        data: {
          members: {
            deleteMany: {
              profileId: profile.id
            }
          }
        },
        include: {
          members: {
            include: {
              profile: true
            },
            orderBy: {
              role: "asc"
            }
          }
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
        console.log(3);
        return NextResponse.json(server);
      } else {
        console.log(4);
        return NextResponse.json({ serverId: profileServer[0].id });
      }
    }

    return new NextResponse("Admin cannot leave the server", { status: 404 });
  } catch (err) {
    console.log("[LEAVE_SERVER_ID]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
