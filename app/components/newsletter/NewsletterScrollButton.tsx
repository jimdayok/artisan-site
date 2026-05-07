"use client";

type NewsletterScrollButtonProps = {
  targetId: string;
  children: React.ReactNode;
  className: string;
};

export default function NewsletterScrollButton({
  targetId,
  children,
  className,
}: NewsletterScrollButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
    >
      {children}
    </button>
  );
}
