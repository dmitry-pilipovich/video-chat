import { redirect } from "next/navigation";
import { redirectToSignIn } from "@clerk/nextjs";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  }
}

const InviteCodePage = async ({
  params
}: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  if (!params.inviteCode) {
    return redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      members: {
        some: {
          id: profile.id
        }
      }
    },
  });

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const updatedServer = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          }
        ]
      },
    },
  });

  if (updatedServer) {
    return redirect(`/servers/${updatedServer.id}`);
  }

  return null;
}

export default InviteCodePage;