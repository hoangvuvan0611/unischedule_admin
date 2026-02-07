'use client'
import {CardViewDashboardItem} from "@/types/cardViewDashboardItem";
import {Box, CalendarDays, EllipsisVertical, Layers, LayoutDashboard, User2} from "lucide-react";
import MiniChart from "@/components/charts/miniChart";
import {accountApi} from "@/services/accountClient";
import {ApiResponseData} from "@/types/response";
import {FullInfoReportOverview} from "@/types/FullInfoReportOverview";
import {useEffect, useState} from "react";

export default function DashBoard() {
  const [cards, setCards] = useState<CardViewDashboardItem[]>([
    {
      title: 'Tổng lượt truy cập',
      color: 'text-lime-600',
      bgColor: 'bg-green-50',
      icon: Layers,
      mainValue: 0,
      chartData: [],
    },
    {
      title: 'Lượt mới trong ngày',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: LayoutDashboard,
      mainValue: 0,
      chartData: []
    },
    {
      title: 'Ghi nhận user mới trong ngày',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: User2,
      mainValue: 0,
      chartData: [],
    },
    {
      title: 'Số lượng khoá sử dụng',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: Box,
      mainValue: 0,
      chartData: [],
    }
  ]);

  useEffect(() => {
    accountApi.fullInfoReportOverview().then((response : ApiResponseData<FullInfoReportOverview>) => {
      if (response.status === 200) {
        const data = response.data;
        cards.map((item, index) => {
          if (index === 0) {
            const dataTotalInfo = data.totalVisits;
            const visitsDayInfo = data.visitsDayInfoDTO;
            setCards(prev =>
              prev.map(card => {
                switch (card.title) {
                  case 'Tổng lượt truy cập':
                    return { ...card, mainValue: dataTotalInfo.total };
                  case 'Lượt mới trong ngày':
                    return { ...card,
                      mainValue: visitsDayInfo.total,

                    };
                  default:
                    return card;
                }
              })
            );
          }
        })
      }
    })
  }, []);

  return (
    <div className="min-h-screen px-8 py-2">
      <div className="flex justify-around gap-8">
        {cards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex-1/4 p-4 border-1 border-gray-200 rounded-2xl bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 ${item.color} ${item.bgColor} rounded-md `}>
                    <Icon/>
                  </div>
                  <div className="text-sm font-bold">
                    {item.title}
                  </div>
                </div>
                <div className="hover:bg-gray-100 rounded-xl p-2 ">
                  <EllipsisVertical />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-4">
                {/*<MiniChart width={'w-1/2'} height={'w-1/2'} />*/}
                <div className="p-6 rounded-2xl bg-gray-100 text-md font-bold">
                  {item.mainValue}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}