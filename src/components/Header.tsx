import Image from "next/image";

export default function Header() {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Image
          src="/daybit_icon.png"
          alt="DayBit Icon"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          DayBit
        </h1>
      </div>
      <p className="text-gray-600 text-lg">
        One Word, Every Day
      </p>
    </header>
  );
}