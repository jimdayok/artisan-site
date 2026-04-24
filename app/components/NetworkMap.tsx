import Image from "next/image";

export default function NetworkMap() {
  return (
    <div className="mx-auto w-full">
      <Image
        src="/network-map.png"
        alt="Artisan Lab Network Map"
        width={1600}
        height={900}
        className="mx-auto h-auto w-full object-contain"
      />
    </div>
  );
}
