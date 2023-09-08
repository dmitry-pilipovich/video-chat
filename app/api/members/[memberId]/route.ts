import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { memberId } = params;
    const { role } = await req.json();

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

    if (!memberId) {
      return new NextResponse("[Bad Request] - Member ID is missing", {
        status: 400
      });
    }

    const existingServer = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id
      }
    });

    if (existingServer) {
      const server = await db.server.update({
        where: {
          id: existingServer.id
        },
        data: {
          members: {
            updateMany: {
              where: {
                id: memberId,
                profileId: {
                  not: profile.id
                }
              },
              data: {
                role
              }
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

      return NextResponse.json(server);
    }

    return new NextResponse("Access denied", { status: 403 });
  } catch (err) {
    console.log("[MEMBERS_ID_PATCH]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { memberId } = params;

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

    if (!memberId) {
      return new NextResponse("[Bad Request] - Member ID is missing", {
        status: 400
      });
    }

    const existingServer = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id
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
              id: memberId,
              profileId: {
                not: profile.id
              }
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

      return NextResponse.json(server);
    }

    return new NextResponse("Access denied", { status: 403 });
  } catch (err) {
    console.log("[MEMBERS_ID_DELETE]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
