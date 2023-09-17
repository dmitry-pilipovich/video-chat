"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Edit,
  Hash,
  Lock,
  Mic,
  ShieldAlert,
  ShieldCheck,
  Trash,
  Video
} from "lucide-react";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap: { [key in ChannelType]: JSX.Element } = {
  [ChannelType.TEXT]: <Hash className="flex-shrink-0 w-5 h-5 text-zinc-500" />,
  [ChannelType.AUDIO]: <Mic className="flex-shrink-0 w-5 h-5 text-zinc-500" />,
  [ChannelType.VIDEO]: <Video className="flex-shrink-0 w-5 h-5 text-zinc-500" />
};

const roleIconMap: { [key in MemberRole]: JSX.Element | null } = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
};

export const ServerChannel = ({
  channel,
  server,
  role
}: ServerChannelProps) => {
  const params = useParams();
  const router = useRouter();

  const Icon = (iconMap[channel.type] as JSX.Element) || null;

  return (
    <button
      onClick={() => {}}
      className={cn(
        "group px-2 py-2 rounded-md flex -utems-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        "divide-x-0",
        params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      {/* <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500" /> */}
      {iconMap[channel.type]}
      <p
        className={cn(
          "line-clamp-1 text-sm font-medium text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.channelId === channel.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              className="hidden group-hover:block w-4 h-4
              text-zinc-500 hover:text-zinc-600 dark:text-zinc-400
              dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              className="hidden group-hover:block w-4 h-4
              text-zinc-500 hover:text-zinc-600 dark:text-zinc-400
              dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <div className="ml-auto flex items-center gap-x-2">
          <Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </div>
      )}
    </button>
  );
};
