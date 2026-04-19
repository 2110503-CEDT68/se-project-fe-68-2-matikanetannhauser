import Link from "next/link";

export default function TopMenuItem({ title, pageRef, cstart, cend }: { title: string, pageRef: string, cstart: string, cend: string }) {
  return (
    <li>
      <Link href={pageRef} className=" h-[80px] w-[190px] !text-white font-bold block rounded-xl px-1.5 py-1.5 transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-xl" 
          style={{ background: `linear-gradient(to top right, ${cstart}, ${cend})`,}}>

        <div className=" h-[100%] border-[1px] border-white rounded-lg  text-center flex items-center justify-center text-l ">
          {title}
        </div>

      </Link>
    </li>
  );
}