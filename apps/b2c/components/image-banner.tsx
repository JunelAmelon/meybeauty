import Image from "next/image"

export function ImageBanner() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      <Image
        src="/b2c/teint-produit copy.jpg"
        alt="Mey Beauty"
        fill
        className="object-cover"
        priority={false}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(82, 58, 40, 0.28)'
        }}
      ></div>
    </section>
  )
}
