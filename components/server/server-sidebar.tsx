import { redirect } from "next/navigation";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

import { ServerHeader } from "@/components/server/server-header";
import { ServerSearch } from "@/components/server/server-search";
import { ServerSection } from "@/components/server/server-section";
import { ServerChannel } from "@/components/server/server-channel";
import { ServerMember } from "@/components/server/server-member";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc"
        }
      },
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

  const textChannels = server?.channels.filter(
    channel => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    channel => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    channel => channel.type === ChannelType.VIDEO
  );

  const members = server?.members.filter(
    member => member.profileId !== profile.id
  );

  if (!server) {
    return redirect("/");
  }

  const role = server.members.find(member => member.profileId === profile.id)
    ?.role;

  return (
    <div
      className="flex flex-col h-full text-promary
      w-full dark:bg-[#2B2D31] bg-[#f2f3f5]"
    >
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map(channel => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id
                }))
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map(channel => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id
                }))
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map(channel => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id
                }))
              },
              {
                label: "Members",
                type: "member",
                data: members?.map(member => ({
                  icon: roleIconMap[member.role],
                  name: member.profile.name,
                  id: member.profile.id
                }))
              }
            ]}
          />
        </div>
        <Separator className="bg-zinc-500 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels.map(channel => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels.map(channel => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Video Channels"
            />
            <div className="space-y-[2px]">
              {videoChannels.map(channel => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Memebers"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map(member => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
