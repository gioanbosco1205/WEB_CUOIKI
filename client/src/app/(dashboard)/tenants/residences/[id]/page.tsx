"use client";

import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetAuthUserQuery,
  useGetLeasesQuery,
  useGetPaymentsQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { Lease, Payment, Property } from "@/types/prismaTypes";
import {
  ArrowDownToLineIcon,
  Check,
  CreditCard,
  Download,
  Edit,
  FileText,
  Mail,
  MapPin,
  Save, // 🔹 Thêm icon Save
  User,
  X, // 🔹 Thêm icon X (Cancel)
} from "lucide-react";
import { useParams } from "next/navigation";
// 🔹 1. Import useState
import React, { useState } from "react";

// Dữ liệu ban đầu (Trong ứng dụng thật, bạn sẽ lấy từ API/props)
const originalCardInfo = {
  bankName: "BIDV",
  expiryYear: 2024,
  expiryDate: "26/06/2024",
  email: "Hieuduc@gmail.com",
  isDefault: true,
};

const PaymentMethod = () => {
  // 🔹 1. Tạo state để quản lý chế độ edit và dữ liệu
  const [isEditing, setIsEditing] = useState(false);
  const [cardInfo, setCardInfo] = useState(originalCardInfo);

  // 🔹 2. Hàm xử lý khi gõ vào input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 🔹 CẬP NHẬT LOGIC:
    if (name === "expiryDate") {
      let year = cardInfo.expiryYear; // Giữ năm cũ nếu nhập chưa đủ
      const parts = value.split("/");

      // Nếu đủ 3 phần (DD/MM/YYYY) và năm có 4 chữ số
      if (parts.length === 3 && parts[2]?.length === 4) {
        const parsedYear = parseInt(parts[2], 10);
        if (!isNaN(parsedYear)) {
          year = parsedYear; // Cập nhật năm
        }
      }

      setCardInfo((prev) => ({
        ...prev,
        expiryDate: value, // Cập nhật ngày hết hạn
        expiryYear: year, // Cập nhật năm đã trích xuất
      }));
    } else {
      // Xử lý các input khác (bankName, email)
      setCardInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 🔹 3. Hàm xử lý khi bấm Lưu
  const handleSave = () => {
    // TODO: Gọi API để lưu `cardInfo` vào database ở đây
    // Sau khi lưu thành công:
    console.log("Đã lưu:", cardInfo);
    originalCardInfo.bankName = cardInfo.bankName; // Cập nhật dữ liệu gốc (cho demo)
    originalCardInfo.email = cardInfo.email;
    originalCardInfo.expiryDate = cardInfo.expiryDate;
    originalCardInfo.expiryYear = cardInfo.expiryYear; // Cập nhật expiryYear
    setIsEditing(false);
  };

  // 🔹 4. Hàm xử lý khi bấm Hủy
  const handleCancel = () => {
    // Reset lại dữ liệu về ban đầu
    setCardInfo(originalCardInfo);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mt-10 md:mt-0 flex-1">
      <h2 className="text-2xl font-bold mb-4">Phương thức thanh toán</h2>
      <p className="mb-4">Thay đổi cách thanh toán cho gói dịch vụ của bạn.</p>
      <div className="border rounded-lg p-6">
        {/* 🔹 5. Hiển thị có điều kiện */}
        {isEditing ? (
          // --- CHẾ ĐỘ CHỈNH SỬA ---
          <div>
            <div className="flex gap-10">
              <div className="w-36 h-20 bg-blue-800 flex items-center justify-center rounded-md">
                {/* Input cho Tên Ngân hàng */}
                <input
                  type="text"
                  name="bankName"
                  value={cardInfo.bankName}
                  onChange={handleChange}
                  className="w-28 text-center bg-transparent text-white text-2xl font-bold border-b-2 border-white"
                />
              </div>

              <div className="flex flex-col justify-between w-full gap-2">
                {/* Input cho Email */}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={cardInfo.email}
                    onChange={handleChange}
                    className="text-sm text-gray-700 p-1 border rounded-md w-full"
                  />
                </div>

                {/* 🔹 ĐÃ XÓA Ô INPUT NĂM HẾT HẠN */}

                {/* Input cho Ngày hết hạn */}
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 w-16">Ngày HH:</span>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardInfo.expiryDate}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    className="text-sm text-gray-700 p-1 border rounded-md w-full"
                  />
                </div>
              </div>
            </div>

            <hr className="my-4" />
            {/* Nút Lưu và Hủy */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5 mr-2" />
                <span>Hủy</span>
              </button>
              <button
                onClick={handleSave}
                className="bg-primary-700 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-800"
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        ) : (
          // --- CHẾ ĐỘ XEM (Như bạn mô tả) ---
          <div>
            <div className="flex gap-10">
              <div className="w-36 h-20 bg-blue-800 flex items-center justify-center rounded-md">
                {/* Hiển thị dữ liệu từ state */}
                <span className="text-white text-2xl font-bold">
                  {cardInfo.bankName}
                </span>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-5">
                    {/* 🔹 Tự động cập nhật Tên và Năm */}
                    <h3 className="text-lg font-semibold">
                      {cardInfo.bankName} sẽ hết hạn vào {cardInfo.expiryYear}
                    </h3>
                    {cardInfo.isDefault && (
                      <span className="text-sm font-medium border border-primary-700 text-primary-700 px-3 py-1 rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <CreditCard className="w-4 h-4 mr-1" />
                    {/* Hiển thị dữ liệu từ state */}
                    <span>Hết hạn • {cardInfo.expiryDate}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {/* Hiển thị dữ liệu từ state */}
                  <span>{cardInfo.email}</span>
                </div>
              </div>
            </div>

            <hr className="my-4" />
            <div className="flex justify-end">
              {/* 🔹 6. Nút Chỉnh sửa kích hoạt state */}
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50"
              >
                <Edit className="w-5 h-5 mr-2" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResidenceCard = ({
  property,
  currentLease,
}: {
  property: Property;
  currentLease: Lease;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex gap-5">
        {/* ✅ Hiển thị ảnh */}
        {property.photoUrls && property.photoUrls.length > 0 ? (
          <img
            src={property.photoUrls[0]}
            alt={property.name}
            className="w-64 h-32 object-cover rounded-xl"
          />
        ) : (
          <div className="w-64 h-32 bg-slate-300 rounded-xl flex items-center justify-center text-gray-500">
            Không có ảnh
          </div>
        )}

        <div className="flex flex-col justify-between">
          <div>
            <div className="bg-green-500 w-fit text-white px-4 py-1 rounded-full text-sm font-semibold">
              Hộp đồng thuê đang hoạt động
            </div>

            <h2 className="text-2xl font-bold my-2">{property.name}</h2>
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 mr-1" />
              <span>
                {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            {currentLease.rent}{" "}
            <span className="text-gray-500 text-sm font-normal">
              {" "}
              VNĐ / Tháng
            </span>
          </div>
        </div>
      </div>
      {/* Dates */}
      <div>
        <hr className="my-4" />
        <div className="flex justify-between items-center">
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">Bắt đầu: </div>
            <div className="font-semibold">
              {new Date(currentLease.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="border-[0.5px] border-primary-300 h-4" />
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">Kết thúc vào: </div>
            <div className="font-semibold">
              {new Date(currentLease.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="border-[0.5px] border-primary-300 h-4" />
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">Thanh toán tiếp theo: </div>
            <div className="font-semibold">
              {new Date(currentLease.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        <hr className="my-4" />
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2 w-full">
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
          <User className="w-5 h-5 mr-2" />
          Quản lý
        </button>
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
          <Download className="w-5 h-5 mr-2" />
          Đồng ý và tải xuống hợp đồng
        </button>
      </div>
    </div>
  );
};

const BillingHistory = ({ payments }: { payments: Payment[] }) => {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Lịch sử thanh toán </h2>
          <p className="text-sm text-gray-500">
            Tải xuống biên lai và thông tin chi tiết về gói cước trước đây của
            bạn.
          </p>
        </div>
        <div>
          <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
            <Download className="w-5 h-5 mr-2" />
            <span>Tải xuống tất cả</span>
          </button>
        </div>
      </div>
      <hr className="mt-4 mb-1" />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hóa đơn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày thanh toán</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="h-16">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Invoice #{payment.id} -{" "}
                    {new Date(payment.paymentDate).toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      payment.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : payment.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    }`}
                  >
                    {payment.paymentStatus === "Paid" ? (
                      <Check className="w-4 h-4 inline-block mr-1" />
                    ) : null}

                    {/* 🔹 Dịch sang tiếng Việt */}
                    {payment.paymentStatus === "Paid"
                      ? "Đã thanh toán"
                      : payment.paymentStatus === "Pending"
                      ? "Đang chờ"
                      : "Thất bại"}
                  </span>
                </TableCell>

                <TableCell>
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell>${payment.amountPaid.toFixed(2)}</TableCell>
                <TableCell>
                  <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50">
                    <ArrowDownToLineIcon className="w-4 h-4 mr-1" />
                    Tải xuống
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const Residence = () => {
  const { id } = useParams() as { id: string };
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetPropertyQuery(Number(id));

  const { data: leases, isLoading: leasesLoading } = useGetLeasesQuery(
    parseInt(authUser?.cognitoInfo?.userId || "0"),
    { skip: !authUser?.cognitoInfo?.userId }
  );
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery(
    leases?.[0]?.id || 0,
    { skip: !leases?.[0]?.id }
  );

  if (propertyLoading || leasesLoading || paymentsLoading) return <Loading />;
  if (!property || propertyError) return <div>Error loading property</div>;

  const currentLease = leases?.find(
    (lease) => lease.propertyId === property.id
  );

  return (
    <div className="dashboard-container p-6">
      <div className="w-full mx-auto">
        <div className="md:flex gap-10">
          {currentLease ? (
            <ResidenceCard property={property} currentLease={currentLease} />
          ) : (
            <div className="flex-1 p-6 bg-white rounded-xl shadow-md">
              Không tìm thấy hợp đồng thuê cho căn hộ này.
            </div>
          )}
          <PaymentMethod />
        </div>
        <BillingHistory payments={payments || []} />
      </div>
    </div>
  );
};

export default Residence;