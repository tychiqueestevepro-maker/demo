import Image from "next/image";

const channelOptions = [
  { name: "LinkedIn", logo: "/logos/linkedin.svg" },
  { name: "Gmail", logo: "/logos/gmail.svg" },
  { name: "Outlook", logo: "/logos/outlook.svg" },
  { name: "Slack", logo: "/logos/slack.svg" },
  { name: "WhatsApp", logo: "/logos/whatsapp.svg" },
  { name: "Teams", logo: "/logos/teams.svg" },
];

export function ChannelLogoPill({ channels }: { channels: string[] }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 shadow-sm">
      {channels.map((channel) => {
        const knownChannel = channelOptions.find((option) => option.name === channel);

        return knownChannel ? (
          <Image
            key={channel}
            src={knownChannel.logo}
            alt={`${channel} logo`}
            width={18}
            height={18}
            className="h-4.5 w-4.5"
          />
        ) : (
          <span key={channel} className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-700">
            {channel.slice(0, 2).toUpperCase()}
          </span>
        );
      })}
    </span>
  );
}
