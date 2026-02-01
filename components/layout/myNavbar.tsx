import {ListIndentDecrease} from "lucide-react";
import Image from "next/image";

export default function MyNavbar() {
  return (
    <div className="flex justify-around py-2 max-h-1/12">
      <div className="w-2/12 flex items-center px-4">
        <div className="hover:bg-gray-100 p-2 rounded-4xl mr-2">
          <ListIndentDecrease width={20} height={20} />
        </div>
        <div className="flex items-center justify-between">
          <Image
            alt={"Logo UniSchedule"}
            src={"/logo_unischedule.jpg"}
            width={50}
            height={50}
            sizes="(max-width: 768px) 32px, (max-width: 1024px) 40px, 48px"
            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
          />
          <div className="font-bold text-lg">
            Uni <span className="text-green-700">Schedule</span>
          </div>
        </div>
      </div>
      <div className="w-10/12 flex items-center px-4">
      </div>
    </div>
  );
}