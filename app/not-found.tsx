import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className={"flex h-screen flex-col items-center justify-center"}>
      <div className={'text-3xl font-bold m-3'}>404 - Không tìm thấy trang</div>
      <p>Xin lỗi, trang bạn đang tìm không tồn tại!!!!!!!</p>
      <Link href="/" style={{ color: "blue", textDecoration: "underline" }}>
        Quay về trang chủ
      </Link>
      <br/>
      <Image
        src={"/not_found.png"}
        alt={"not found"}
        width={300}
        height={300}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        priority={true}
        quality={100}
      />
    </div>
  );
}