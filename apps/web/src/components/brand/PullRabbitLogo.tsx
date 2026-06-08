import { PullRabbitMark } from "@/components/landing/brand/PullRabbitMark";

type PullRabbitLogoProps = {
  className?: string;
  markClassName?: string;
};

export function PullRabbitLogo({ className = "", markClassName = "" }: PullRabbitLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full border border-current/20 ${markClassName}`}>
        <PullRabbitMark />
      </span>
      <span className="text-[28px] font-normal leading-none">PullRabbit</span>
    </div>
  );
}
