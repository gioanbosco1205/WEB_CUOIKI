import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Property } from "@/types/prismaTypes"; // thêm import kiểu

type ContactWidgetProps = {
  property: Property;
  onOpenModal: () => void;
};

const ContactWidget = ({ property, onOpenModal }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-white border border-primary-200 rounded-2xl p-7 h-fit min-w-[300px]">
      {/* Contact Property */}
      <div className="flex items-center gap-5 mb-4 border border-primary-200 p-4 rounded-xl">
        <div className="flex items-center p-4 bg-primary-900 rounded-full">
          <Phone className="text-primary-50" size={15} />
        </div>
        <div>
          <p>Liên hệ với chủ trọ</p>
          <div className="text-lg font-bold text-primary-800">
            {property?.manager?.phoneNumber || "Chưa có số điện thoại"}
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-primary-700 text-white hover:bg-primary-600"
        onClick={handleButtonClick}
      >
        {authUser ? "Gửi yêu cầu thuê" : "Đăng nhập để gửi yêu cầu"}
      </Button>

      <hr className="my-4" />
      <div className="text-sm">
        <div className="text-primary-600">
         Làm việc từ T2 - T6, 8:00 - 18:00
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
