"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import Link from "next/link";
import React, { useState, useCallback } from "react";
import jsPDF from "jspdf";
// 1. IMPORT TỪ FILE MỚI (Thay vì vni-times)
import { fontNormal, fontBold } from "@/lib/vni-times";
import { Application } from "@/types/application";

const Applications: React.FC = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const {
    data: applications = [],
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "manager",
    },
    { skip: !authUser?.cognitoInfo?.userId }
  );

  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  // Đã xóa useEffect đăng ký font toàn cục vì không cần thiết nữa

  // Lọc ứng dụng theo tab
  const filteredApplications = React.useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter(
      (app) => app.status.toLowerCase() === activeTab
    );
  }, [applications, activeTab]);

  // Tạo hợp đồng PDF
  const generateContractPDF = useCallback((application: Application) => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      // --- BẮT ĐẦU CẤU HÌNH FONT MỚI ---
      const fontName = "TimesNewRoman"; // Đặt tên font để dùng trong code

      // 1. Thêm file font vào hệ thống file ảo của jsPDF
      doc.addFileToVFS("TimesNewRoman-Regular.ttf", fontNormal);
      doc.addFileToVFS("TimesNewRoman-Bold.ttf", fontBold);

      // 2. Đăng ký font để sử dụng
      doc.addFont("TimesNewRoman-Regular.ttf", fontName, "normal");
      doc.addFont("TimesNewRoman-Bold.ttf", fontName, "bold");

      // 3. Set font mặc định
      doc.setFont(fontName, "normal");
      // --- KẾT THÚC CẤU HÌNH FONT ---

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 45;

      // Tiêu đề
      doc.setFont(fontName, "bold"); // Chuyển sang in đậm
      doc.setFontSize(22);
      doc.text("HỢP ĐỒNG THUÊ NHÀ", pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(12);

      const addLine = (label: string, value: string, isBold = false) => {
        // Label
        doc.setFont(fontName, isBold ? "bold" : "normal");
        doc.text(`${label}:`, margin, y);
        
        // Value (Luôn để thường cho dễ đọc, hoặc sửa tùy ý)
        doc.setFont(fontName, "normal"); 
        doc.text(value, margin + 40, y);
        y += 8;
      };

      addLine("Mã đơn đăng ký", `${application.id}`);
      addLine("Tài sản", application.property.name);
      
      const address = `${application.property.location.city || ""}, ${application.property.location.country || ""}`;
      addLine("Địa chỉ", address);
      
      addLine("Giá thuê", `${application.property.pricePerMonth.toLocaleString()} VNĐ / tháng`);
      y += 5;

      addLine("Người thuê", application.tenant.name);
      addLine("Số điện thoại", application.tenant.phoneNumber);
      addLine("Email", application.tenant.email);
      y += 5;

      addLine("Chủ nhà / Quản lý", application.manager.name);
      y += 5;

      // Dòng tiêu đề mục
      doc.setFont(fontName, "bold"); 
      doc.text("Thời hạn hợp đồng:", margin, y);
      y += 8;

      addLine("Từ ngày", new Date(application.lease.startDate).toLocaleDateString("vi-VN"));
      addLine("Đến ngày", new Date(application.lease.endDate).toLocaleDateString("vi-VN"));
      addLine("Lần thanh toán tiếp theo ", new Date(application.lease.nextPaymentDate).toLocaleDateString("vi-VN"));
      y += 5;

      addLine("Ngày lập hợp đồng", new Date().toLocaleDateString("vi-VN"));

      y += 20;
      doc.setFontSize(14);
      doc.setFont(fontName, "bold");
      doc.text("BÊN THUÊ", margin, y);
      doc.text("BÊN CHO THUÊ", pageWidth - margin - 40, y);
      y += 25;
      
      doc.setFontSize(11);
      doc.setFont(fontName, "normal");
      doc.text("(Ký, ghi rõ họ tên)", margin, y);
      doc.text("(Ký, ghi rõ họ tên)", pageWidth - margin - 40, y);

      const safeName = application.property.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 30);
      doc.save(`HopDong_Thue_${safeName}_${application.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Không thể tạo hợp đồng. Vui lòng thử lại.");
    }
  }, []);

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (id: number, status: "Approved" | "Denied") => {
    if (updatingIds.has(id)) return;
    setUpdatingIds((prev) => new Set(prev).add(id));

    try {
      await updateApplicationStatus({ id, status }).unwrap();
    } catch (err) {
      console.error("Cập nhật trạng thái thất bại:", err);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !applications.length)
    return (
      <div className="text-center text-red-600 py-10">
        {isError ? "Lỗi tải đơn đăng ký" : "Không có đơn đăng ký nào"}
      </div>
    );

  return (
    <div className="dashboard-container">
      <Header
        title="Đơn đăng ký"
        subtitle="Xem và quản lý các đơn đăng ký thuê cho tài sản của bạn"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full my-5">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Đang chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã phê duyệt</TabsTrigger>
          <TabsTrigger value="denied">Bị từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-5 space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Không có đơn đăng ký nào ở trạng thái này.
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                userType="manager"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-5 w-full pb-4 px-4">
                  <div
                    className={`p-4 text-sm grow rounded-lg flex flex-wrap items-center gap-2 ${
                      application.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : application.status === "Denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <File className="w-5 h-5 flex-shrink-0" />
                    <span>
                      Nộp ngày{" "}
                      {new Date(application.applicationDate).toLocaleDateString("vi-VN")}
                    </span>
                    <CircleCheckBig className="w-5 h-5 flex-shrink-0" />
                    <span
                      className={`font-semibold ${
                        application.status === "Approved"
                          ? "text-green-800"
                          : application.status === "Denied"
                          ? "text-red-800"
                          : "text-yellow-800"
                      }`}
                    >
                      {application.status === "Approved" && "Đã chấp nhận"}
                      {application.status === "Denied" && "Đã từ chối"}
                      {application.status === "Pending" && "Đang chờ duyệt"}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/managers/properties/${application.property.id}`}
                      className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-white transition-colors text-sm"
                      scroll={false}
                    >
                      <Hospital className="w-5 h-5 mr-2" />
                      Chi tiết tài sản
                    </Link>

                    {application.status === "Approved" && (
                      <button
                        onClick={() => generateContractPDF(application)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-white transition-colors text-sm"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Tải hợp đồng
                      </button>
                    )}

                    {application.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(application.id, "Approved")}
                          disabled={updatingIds.has(application.id)}
                          className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingIds.has(application.id) ? "Đang xử lý..." : "Chấp thuận"}
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id, "Denied")}
                          disabled={updatingIds.has(application.id)}
                          className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingIds.has(application.id) ? "Đang xử lý..." : "Từ chối"}
                        </button>
                      </>
                    )}

                    {application.status === "Denied" && (
                      <button className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-gray-700 text-sm">
                        Liên hệ người dùng
                      </button>
                    )}
                  </div>
                </div>
              </ApplicationCard>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Applications;