export default function Home() {
  return (
    <a
      href="https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK"
      className="relative flex min-h-screen w-full items-center justify-center cursor-pointer group overflow-hidden"
    >
      {/* 
        Capa 1: La imagen de fondo. 
        Se mantiene siempre en el fondo. Absolute inset-0 ocupa todo el contenedor relative (w-full min-h-screen).
      */}
      <div
        className="absolute w-full h-full inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
        style={{ backgroundImage: "url('https://i.postimg.cc/NjMVBm49/chad1.png')" }}
      />

      {/* 
        Capa 2: El efecto "Liquid Glass". 
        Cubre la imagen. Al hacer hover en el contenedor padre, el desenfoque desaparece.
      */}
      <div
        className="absolute w-full h-full inset-0 z-10 bg-black/50 backdrop-blur-xl transition-all duration-700 ease-in-out group-hover:backdrop-blur-none group-hover:bg-black/0"
      />

      {/* 
        Capa 3: El contenido (Texto + Video). 
        Por encima del cristal (z-20) para que nunca se desenfoque.
      */}
      <div className="relative z-20 w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Lado izquierdo: Texto */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-6xl md:text-7xl text-[#00FF00] font-extrabold underline animate-neon-pulse transition-all drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]">
            SEMPI. Únete ahora.
          </h1>
        </div>

        {/* Lado derecho: Video */}
        <div className="flex-none w-64 md:w-80 aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.4)] border-4 border-[#00FF00]">
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dhwd9gz6o&public_id=WhatsApp_Video_2026-02-17_at_17.22.35_yecxvh&player[fluid]=true&player[autoplay]=true&player[loop]=true&player[controls]=true"
            className="w-full h-full object-cover"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </a>
  );
}